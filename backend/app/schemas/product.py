from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductPriceTierBase(BaseModel):
    min_quantity: float
    price_per_unit: float

class ProductPriceTierCreate(ProductPriceTierBase):
    pass

class ProductPriceTierOut(ProductPriceTierBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    category: str
    description: str
    image_url: str
    quantity: float
    unit: str
    price_per_unit: float
    harvest_date: str
    district: str
    state: str
    latitude: Optional[float] = 11.0168
    longitude: Optional[float] = 76.9558
    is_organic: Optional[bool] = False

class ProductCreate(ProductBase):
    price_tiers: Optional[List[ProductPriceTierCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    price_per_unit: Optional[float] = None
    harvest_date: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    is_organic: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farm_name: Optional[str] = None
    is_fpo: Optional[bool] = False
    verification_status: Optional[str] = "UNVERIFIED"
    is_active: bool
    price_tiers: List[ProductPriceTierOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

