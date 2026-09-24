from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.db.models import (
    User, UserRole, Product, Order, OrderStatus, Delivery, DeliveryStatus, FarmerProfile
)
from app.api.deps import get_current_user, require_roles
from app.api.v1.products import format_product_out
from app.api.v1.orders import format_order_out

router = APIRouter()

@router.get("/farmer")
def farmer_dashboard_stats(
    current_user: User = Depends(require_roles([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    fp = current_user.farmer_profile
    if not fp:
        raise HTTPException(status_code=400, detail="Farmer profile not found")

    active_listings_count = db.query(Product).filter(Product.farmer_id == fp.id, Product.is_active == True).count()
    pending_orders_count = db.query(Order).filter(
        Order.farmer_id == fp.id,
        Order.status.in_([OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PACKED])
    ).count()

    delivered_orders_count = db.query(Order).filter(
        Order.farmer_id == fp.id,
        Order.status == OrderStatus.DELIVERED
    ).count()

    total_earnings = db.query(func.sum(Order.total_amount)).filter(
        Order.farmer_id == fp.id,
        Order.status == OrderStatus.DELIVERED
    ).scalar() or 0.0

    recent_orders = db.query(Order).filter(Order.farmer_id == fp.id).order_by(Order.created_at.desc()).limit(5).all()
    my_products = db.query(Product).filter(Product.farmer_id == fp.id, Product.is_active == True).limit(5).all()

    return {
        "active_listings": active_listings_count,
        "pending_orders": pending_orders_count,
        "delivered_orders": delivered_orders_count,
        "total_earnings": round(total_earnings, 2),
        "recent_orders": [format_order_out(o) for o in recent_orders],
        "products": [format_product_out(p) for p in my_products]
    }

@router.get("/buyer")
def buyer_dashboard_stats(
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    total_orders = db.query(Order).filter(Order.buyer_id == current_user.id).count()
    pending_orders = db.query(Order).filter(
        Order.buyer_id == current_user.id,
        Order.status.in_([OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PACKED, OrderStatus.READY_FOR_PICKUP, OrderStatus.IN_TRANSIT])
    ).count()

    total_spent = db.query(func.sum(Order.total_amount)).filter(
        Order.buyer_id == current_user.id,
        Order.status == OrderStatus.DELIVERED
    ).scalar() or 0.0

    recent_orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).limit(5).all()

    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_spent": round(total_spent, 2),
        "recent_orders": [format_order_out(o) for o in recent_orders]
    }

@router.get("/logistics")
def logistics_dashboard_stats(
    current_user: User = Depends(require_roles([UserRole.LOGISTICS, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    lp = current_user.logistics_profile
    if not lp:
        raise HTTPException(status_code=400, detail="Logistics profile not found")

    assigned_count = db.query(Delivery).filter(
        Delivery.logistics_partner_id == lp.id,
        Delivery.status.in_([DeliveryStatus.ASSIGNED, DeliveryStatus.ACCEPTED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT])
    ).count()

    completed_count = db.query(Delivery).filter(
        Delivery.logistics_partner_id == lp.id,
        Delivery.status == DeliveryStatus.DELIVERED
    ).count()

    pool_count = db.query(Delivery).filter(
        Delivery.status == DeliveryStatus.UNASSIGNED,
        Delivery.pickup_district == lp.current_district
    ).count()

    my_deliveries = db.query(Delivery).filter(Delivery.logistics_partner_id == lp.id).order_by(Delivery.created_at.desc()).limit(5).all()

    return {
        "active_deliveries": assigned_count,
        "completed_deliveries": completed_count,
        "unassigned_pool_count": pool_count,
        "recent_deliveries": [
            {
                "id": d.id,
                "order_id": d.order_id,
                "order_number": d.order.order_number if d.order else "",
                "pickup_district": d.pickup_district,
                "drop_district": d.drop_district,
                "status": d.status.value if hasattr(d.status, 'value') else d.status,
                "distance_km": d.distance_km,
                "estimated_minutes": d.estimated_minutes
            }
            for d in my_deliveries
        ]
    }

