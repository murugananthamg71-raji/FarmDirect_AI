from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import Delivery, DeliveryStatus, Order, User, UserRole, LogisticsProfile
from app.api.deps import get_current_user, require_roles
from app.api.v1.orders import format_order_out
from app.services.ai.route import TSP2OptRouteOptimizer
from app.services.ai.interface import RouteRequest, StopPoint

router = APIRouter()
route_optimizer = TSP2OptRouteOptimizer()

@router.get("/deliveries")
def list_deliveries(
    status_filter: str = "ALL",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Delivery)

    if current_user.role == UserRole.LOGISTICS:
        lp = current_user.logistics_profile
        # Logistics sees unassigned pool in their district OR assigned to them
        if status_filter == "UNASSIGNED":
            query = query.filter(Delivery.status == DeliveryStatus.UNASSIGNED, Delivery.pickup_district == lp.current_district)
        elif status_filter == "MY":
            query = query.filter(Delivery.logistics_partner_id == lp.id)
        else:
            query = query.filter(
                (Delivery.logistics_partner_id == lp.id) |
                ((Delivery.status == DeliveryStatus.UNASSIGNED) & (Delivery.pickup_district == lp.current_district))
            )

    deliveries = query.order_by(Delivery.created_at.desc()).all()
    return [format_delivery_out(d) for d in deliveries]

@router.post("/assign")
def assign_delivery(
    delivery_id: int,
    partner_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    d = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Delivery record not found")

    d.logistics_partner_id = partner_id
    d.status = DeliveryStatus.ASSIGNED
    db.commit()
    return format_delivery_out(d)

@router.post("/deliveries/{delivery_id}/respond")
def respond_delivery(
    delivery_id: int,
    accept: bool,
    current_user: User = Depends(require_roles([UserRole.LOGISTICS])),
    db: Session = Depends(get_db)
):
    d = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Delivery record not found")

    lp = current_user.logistics_profile
    if accept:
        d.logistics_partner_id = lp.id
        d.status = DeliveryStatus.ACCEPTED
    else:
        d.status = DeliveryStatus.DECLINED
        d.logistics_partner_id = None

    db.commit()
    return format_delivery_out(d)

@router.patch("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int,
    status_str: str,
    current_user: User = Depends(require_roles([UserRole.LOGISTICS, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    d = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Delivery record not found")

    try:
        new_status = DeliveryStatus(status_str)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid delivery status: {status_str}")

    d.status = new_status
    db.commit()
    return format_delivery_out(d)

@router.get("/active-route")
def get_active_route(
    current_user: User = Depends(require_roles([UserRole.LOGISTICS, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    lp = current_user.logistics_profile if current_user.role == UserRole.LOGISTICS else None
    query = db.query(Delivery).filter(
        Delivery.status.in_([DeliveryStatus.ACCEPTED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT])
    )
    if lp:
        query = query.filter(Delivery.logistics_partner_id == lp.id)

    deliveries = query.all()

    stops = []
    for d in deliveries:
        first_item = d.order.items[0] if d.order and d.order.items else None
        p_name = first_item.product_name if first_item else "Farm Produce"

        # Pickup stop
        stops.append(StopPoint(
            id=d.id * 10 + 1,
            type="PICKUP",
            name=f"Pickup: {p_name} ({d.pickup_district})",
            district=d.pickup_district,
            latitude=d.pickup_lat,
            longitude=d.pickup_lng,
            order_id=d.order_id
        ))

        # Drop stop
        stops.append(StopPoint(
            id=d.id * 10 + 2,
            type="DROP",
            name=f"Drop: #{d.order.order_number if d.order else 'Order'} ({d.drop_district})",
            district=d.drop_district,
            latitude=d.drop_lat,
            longitude=d.drop_lng,
            order_id=d.order_id
        ))

    start_lat = 11.0168
    start_lng = 76.9558

    route_req = RouteRequest(
        start_district="Coimbatore",
        start_lat=start_lat,
        start_lng=start_lng,
        stops=stops
    )
    return route_optimizer.optimize(route_req)

def format_delivery_out(d: Delivery):
    partner_user = d.partner.user if d.partner else None
    return {
        "id": d.id,
        "order_id": d.order_id,
        "logistics_partner_id": d.logistics_partner_id,
        "partner_name": partner_user.full_name if partner_user else "Unassigned",
        "pickup_district": d.pickup_district,
        "pickup_lat": d.pickup_lat,
        "pickup_lng": d.pickup_lng,
        "drop_district": d.drop_district,
        "drop_address": d.drop_address,
        "drop_lat": d.drop_lat,
        "drop_lng": d.drop_lng,
        "status": d.status.value if hasattr(d.status, 'value') else d.status,
        "distance_km": d.distance_km,
        "estimated_minutes": d.estimated_minutes,
        "order": format_order_out(d.order) if d.order else None,
        "created_at": d.created_at.isoformat() if d.created_at else ""
    }

