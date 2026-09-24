from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.db.models import OrderStatus, PaymentMethod, PaymentStatus

class CartItemCreate(BaseModel):
    product_id: int
    quantity: float

class CartItemUpdate(BaseModel):
    quantity: float

class CheckoutRequest(BaseModel):
    delivery_address: str
    delivery_slot: str
    payment_method: PaymentMethod

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None

class PaymentSimulateRequest(BaseModel):
    method: PaymentMethod

