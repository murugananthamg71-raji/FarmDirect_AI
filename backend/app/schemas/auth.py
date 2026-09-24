from pydantic import BaseModel, EmailStr
from typing import Optional
from app.db.models import UserRole, BuyerType, VerificationStatus

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    # Role specific
    farm_name: Optional[str] = None
    is_fpo: Optional[bool] = False
    member_count: Optional[int] = 1
    buyer_type: Optional[BuyerType] = BuyerType.INDIVIDUAL
    delivery_address: Optional[str] = "Coimbatore, Tamil Nadu"
    vehicle_type: Optional[str] = "Mini Truck (1.5 Ton)"
    vehicle_number: Optional[str] = "TN-37-AZ-9988"
    district: Optional[str] = "Coimbatore"
    state: Optional[str] = "Tamil Nadu"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

