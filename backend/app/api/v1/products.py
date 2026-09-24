from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.db.models import Product, ProductPriceTier, FarmerProfile, User, UserRole, ProductCategory
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.api.deps import get_current_user, require_roles

router = APIRouter()

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(ProductCategory).all()

@router.get("", response_model=dict)
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    district: Optional[str] = None,
    organic_only: Optional[bool] = False,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = Query("newest", regex="^(newest|price_asc|price_desc)$"),
    page: int = 1,
    page_size: int = 12,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(Product.category == category)
    if district:
        query = query.filter(Product.district == district)
    if organic_only:
        query = query.filter(Product.is_organic == True)
    if min_price is not None:
        query = query.filter(Product.price_per_unit >= min_price)
    if max_price is not None:
        query = query.filter(Product.price_per_unit <= max_price)

    if sort_by == "price_asc":
        query = query.order_by(Product.price_per_unit.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price_per_unit.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    formatted_items = []
    for p in items:
        p_dict = format_product_out(p)
        formatted_items.append(p_dict)

    return {
        "items": formatted_items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=444, detail="Product not found")
    return format_product_out(p)

@router.post("", response_model=dict)
def create_product(
    prod_in: ProductCreate,
    current_user: User = Depends(require_roles([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not farmer_profile:
        raise HTTPException(status_code=400, detail="Farmer profile not found for user")

    product = Product(
        farmer_id=farmer_profile.id,
        name=prod_in.name,
        category=prod_in.category,
        description=prod_in.description,
        image_url=prod_in.image_url,
        quantity=prod_in.quantity,
        unit=prod_in.unit,
        price_per_unit=prod_in.price_per_unit,
        harvest_date=prod_in.harvest_date,
        district=prod_in.district,
        state=prod_in.state,
        latitude=prod_in.latitude or farmer_profile.latitude or 11.0168,
        longitude=prod_in.longitude or farmer_profile.longitude or 76.9558,
        is_organic=prod_in.is_organic or False
    )
    db.add(product)
    db.flush()

    if prod_in.price_tiers:
        for pt in prod_in.price_tiers:
            tier = ProductPriceTier(
                product_id=product.id,
                min_quantity=pt.min_quantity,
                price_per_unit=pt.price_per_unit
            )
            db.add(tier)

    db.commit()
    db.refresh(product)
    return format_product_out(product)

@router.put("/{product_id}")
def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    current_user: User = Depends(require_roles([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role != UserRole.ADMIN and p.farmer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this product")

    update_data = prod_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(p, field, val)

    db.commit()
    db.refresh(p)
    return format_product_out(p)

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(require_roles([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role != UserRole.ADMIN and p.farmer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    # Soft delete to preserve order history integrity
    p.is_active = False
    db.commit()
    return {"message": "Product deleted successfully"}

def format_product_out(p: Product):
    farmer_user = p.farmer.user if p.farmer else None
    return {
        "id": p.id,
        "farmer_id": p.farmer_id,
        "farmer_name": farmer_user.full_name if farmer_user else "Farmer",
        "farm_name": p.farmer.farm_name if p.farmer else "",
        "is_fpo": p.farmer.is_fpo if p.farmer else False,
        "verification_status": p.farmer.verification_status.value if p.farmer and hasattr(p.farmer.verification_status, 'value') else "UNVERIFIED",
        "name": p.name,
        "category": p.category,
        "description": p.description,
        "image_url": p.image_url,
        "quantity": p.quantity,
        "unit": p.unit,
        "price_per_unit": p.price_per_unit,
        "harvest_date": p.harvest_date,
        "district": p.district,
        "state": p.state,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "is_organic": p.is_organic,
        "is_active": p.is_active,
        "price_tiers": [
            {"id": pt.id, "product_id": pt.product_id, "min_quantity": pt.min_quantity, "price_per_unit": pt.price_per_unit}
            for pt in p.price_tiers
        ],
        "created_at": p.created_at.isoformat() if p.created_at else ""
    }

