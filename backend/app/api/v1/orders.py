import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import (
    Order, OrderItem, OrderStatusHistory, OrderStatus, CartItem, Product, Payment,
    PaymentMethod, PaymentStatus, Delivery, DeliveryStatus, User, UserRole, Notification
)
from app.schemas.order import CheckoutRequest, OrderStatusUpdate, PaymentSimulateRequest
from app.api.deps import get_current_user, require_roles

router = APIRouter()

ALLOWED_TRANSITIONS = {
    OrderStatus.PLACED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.REJECTED],
    OrderStatus.CONFIRMED: [OrderStatus.PACKED, OrderStatus.CANCELLED, OrderStatus.REJECTED],
    OrderStatus.PACKED: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
    OrderStatus.READY_FOR_PICKUP: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
    OrderStatus.PICKED_UP: [OrderStatus.IN_TRANSIT],
    OrderStatus.IN_TRANSIT: [OrderStatus.DELIVERED],
    OrderStatus.DELIVERED: [],
    OrderStatus.CANCELLED: [],
    OrderStatus.REJECTED: [],
}

@router.post("", response_model=dict)
def checkout_order(
    req: CheckoutRequest,
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    cart_items = db.query(CartItem).filter(CartItem.buyer_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Group cart items by farmer (1 order per farmer)
    farmer_cart: dict[int, list[CartItem]] = {}
    for ci in cart_items:
        fid = ci.product.farmer_id
        if fid not in farmer_cart:
            farmer_cart[fid] = []
        farmer_cart[fid].append(ci)

    created_orders = []

    # Process each farmer order inside a DB transaction block
    try:
        for farmer_id, items in farmer_cart.items():
            order_total = 0.0
            order_items_to_create = []

            # Atomic stock validation & price check
            for ci in items:
                product = db.query(Product).with_for_update().filter(Product.id == ci.product_id).first()
                if not product or not product.is_active:
                    raise HTTPException(status_code=400, detail=f"Product {ci.product.name} is no longer available")
                if ci.quantity > product.quantity:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}. Available: {product.quantity}")

                # Atomic stock decrement
                product.quantity -= ci.quantity
                unit_price = product.price_per_unit

                # Check bulk discount price tiers
                for pt in sorted(product.price_tiers, key=lambda x: x.min_quantity, reverse=True):
                    if ci.quantity >= pt.min_quantity:
                        unit_price = pt.price_per_unit
                        break

                subtotal = round(ci.quantity * unit_price, 2)
                order_total += subtotal

                order_items_to_create.append({
                    "product": product,
                    "quantity": ci.quantity,
                    "price_per_unit": unit_price,
                    "subtotal": subtotal
                })

            order_no = f"FD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            order = Order(
                order_number=order_no,
                buyer_id=current_user.id,
                farmer_id=farmer_id,
                delivery_address=req.delivery_address,
                delivery_slot=req.delivery_slot,
                total_amount=round(order_total, 2),
                status=OrderStatus.PLACED
            )
            db.add(order)
            db.flush()

            for oi_data in order_items_to_create:
                oi = OrderItem(
                    order_id=order.id,
                    product_id=oi_data["product"].id,
                    product_name=oi_data["product"].name,
                    unit=oi_data["product"].unit,
                    quantity=oi_data["quantity"],
                    price_per_unit=oi_data["price_per_unit"],
                    subtotal=oi_data["subtotal"]
                )
                db.add(oi)

            # Order status history
            hist = OrderStatusHistory(
                order_id=order.id,
                from_status=None,
                to_status=OrderStatus.PLACED,
                notes="Order placed by buyer",
                created_by_role="BUYER"
            )
            db.add(hist)

            # Payment record
            payment = Payment(
                order_id=order.id,
                amount=round(order_total, 2),
                method=req.payment_method,
                status=PaymentStatus.SUCCESS if req.payment_method != PaymentMethod.COD else PaymentStatus.COD_PENDING,
                payment_reference=f"PAY-DEMO-{uuid.uuid4().hex[:8].upper()}"
            )
            db.add(payment)

            # Delivery record (unassigned initially)
            first_prod = order_items_to_create[0]["product"]
            delivery = Delivery(
                order_id=order.id,
                pickup_district=first_prod.district,
                pickup_lat=first_prod.latitude,
                pickup_lng=first_prod.longitude,
                drop_district="Coimbatore",
                drop_address=req.delivery_address,
                status=DeliveryStatus.UNASSIGNED,
                distance_km=18.5,
                estimated_minutes=40
            )
            db.add(delivery)

            # Notify farmer
            notif = Notification(
                user_id=first_prod.farmer.user_id,
                title="New Order Received!",
                message=f"Order #{order_no} placed for {first_prod.name} ({order_total} ₹). Please confirm & pack."
            )
            db.add(notif)

            created_orders.append(order_no)

        # Clear buyer cart
        for ci in cart_items:
            db.delete(ci)

        db.commit()
        return {
            "message": "Order(s) placed successfully",
            "orders": created_orders
        }
    except Exception as e:
        db.rollback()
        raise e

@router.get("")
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order)

    if current_user.role == UserRole.BUYER:
        query = query.filter(Order.buyer_id == current_user.id)
    elif current_user.role == UserRole.FARMER:
        query = query.filter(Order.farmer_id == current_user.farmer_profile.id)
    elif current_user.role == UserRole.LOGISTICS:
        # Logistics sees orders assigned to their deliveries
        query = query.join(Delivery).filter(Delivery.logistics_partner_id == current_user.logistics_profile.id)

    orders = query.order_by(Order.created_at.desc()).all()
    return [format_order_out(o) for o in orders]

@router.get("/{order_id}")
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return format_order_out(order)

@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = status_in.status
    curr_status = order.status

    # Validate allowed status transitions
    allowed = ALLOWED_TRANSITIONS.get(curr_status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition order status from {curr_status.value} to {new_status.value}"
        )

    # Restore stock on CANCELLED or REJECTED
    if new_status in [OrderStatus.CANCELLED, OrderStatus.REJECTED]:
        for item in order.items:
            if item.product:
                item.product.quantity += item.quantity

    order.status = new_status

    # Record status history
    hist = OrderStatusHistory(
        order_id=order.id,
        from_status=curr_status,
        to_status=new_status,
        notes=status_in.notes or f"Status updated to {new_status.value}",
        created_by_role=current_user.role.value
    )
    db.add(hist)

    # Update delivery status synchronization
    if order.delivery:
        if new_status == OrderStatus.PACKED:
            order.delivery.status = DeliveryStatus.UNASSIGNED
        elif new_status == OrderStatus.PICKED_UP:
            order.delivery.status = DeliveryStatus.PICKED_UP
        elif new_status == OrderStatus.IN_TRANSIT:
            order.delivery.status = DeliveryStatus.IN_TRANSIT
        elif new_status == OrderStatus.DELIVERED:
            order.delivery.status = DeliveryStatus.DELIVERED

    # Send Notification to buyer
    notif = Notification(
        user_id=order.buyer_id,
        title=f"Order Status Update: {new_status.value}",
        message=f"Your order #{order.order_number} is now {new_status.value}."
    )
    db.add(notif)

    db.commit()
    db.refresh(order)
    return format_order_out(order)

@router.post("/{order_id}/payment/simulate")
def simulate_payment(
    order_id: int,
    req: PaymentSimulateRequest,
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not order.payment:
        pm = Payment(
            order_id=order.id,
            amount=order.total_amount,
            method=req.method,
            status=PaymentStatus.SUCCESS,
            payment_reference=f"PAY-SIMULATED-{uuid.uuid4().hex[:8].upper()}"
        )
        db.add(pm)
    else:
        order.payment.status = PaymentStatus.SUCCESS
        order.payment.method = req.method

    db.commit()
    return {"message": "Simulated payment successful", "payment_status": "SUCCESS"}

def format_order_out(o: Order):
    farmer_user = o.farmer.user if o.farmer else None
    return {
        "id": o.id,
        "order_number": o.order_number,
        "buyer_id": o.buyer_id,
        "farmer_id": o.farmer_id,
        "farmer_name": farmer_user.full_name if farmer_user else "Farmer",
        "farm_name": o.farmer.farm_name if o.farmer else "",
        "delivery_address": o.delivery_address,
        "delivery_slot": o.delivery_slot,
        "total_amount": o.total_amount,
        "status": o.status.value if hasattr(o.status, 'value') else o.status,
        "items": [
            {
                "id": item.id,
                "order_id": item.order_id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "unit": item.unit,
                "quantity": item.quantity,
                "price_per_unit": item.price_per_unit,
                "subtotal": item.subtotal
            }
            for item in o.items
        ],
        "status_history": [
            {
                "id": h.id,
                "order_id": h.order_id,
                "from_status": h.from_status.value if h.from_status and hasattr(h.from_status, 'value') else h.from_status,
                "to_status": h.to_status.value if hasattr(h.to_status, 'value') else h.to_status,
                "notes": h.notes,
                "created_by_role": h.created_by_role,
                "created_at": h.created_at.isoformat() if h.created_at else ""
            }
            for h in o.status_history
        ],
        "payment": {
            "id": o.payment.id,
            "order_id": o.payment.order_id,
            "amount": o.payment.amount,
            "method": o.payment.method.value if hasattr(o.payment.method, 'value') else o.payment.method,
            "status": o.payment.status.value if hasattr(o.payment.status, 'value') else o.payment.status,
            "payment_reference": o.payment.payment_reference
        } if o.payment else None,
        "created_at": o.created_at.isoformat() if o.created_at else ""
    }

