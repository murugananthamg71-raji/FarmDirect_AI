from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import CartItem, Product, User, UserRole
from app.schemas.order import CartItemCreate, CartItemUpdate
from app.api.deps import get_current_user, require_roles
from app.api.v1.products import format_product_out

router = APIRouter()

@router.get("")
def get_cart(
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    items = db.query(CartItem).filter(CartItem.buyer_id == current_user.id).all()
    res = []
    for item in items:
        res.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_per_unit": item.product.price_per_unit,
            "product": format_product_out(item.product)
        })
    return res

@router.post("/items")
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == item_in.product_id, Product.is_active == True).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found or unavailable")

    if item_in.quantity > prod.quantity:
        raise HTTPException(status_code=400, detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({prod.quantity} {prod.unit})")

    existing = db.query(CartItem).filter(
        CartItem.buyer_id == current_user.id,
        CartItem.product_id == item_in.product_id
    ).first()

    if existing:
        existing.quantity += item_in.quantity
    else:
        existing = CartItem(
            buyer_id=current_user.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return {"message": "Item added to cart", "cart_item_id": existing.id}

@router.patch("/items/{item_id}")
def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.buyer_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item_in.quantity <= 0:
        db.delete(item)
        db.commit()
        return {"message": "Cart item removed"}

    if item_in.quantity > item.product.quantity:
        raise HTTPException(status_code=400, detail=f"Quantity exceeds available stock ({item.product.quantity})")

    item.quantity = item_in.quantity
    db.commit()
    return {"message": "Quantity updated"}

@router.delete("/items/{item_id}")
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.buyer_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}

