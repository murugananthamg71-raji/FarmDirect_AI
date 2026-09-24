from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.db.models import User, UserRole, FarmerProfile, BuyerProfile, LogisticsProfile
from app.schemas.auth import UserRegister, UserLogin, Token
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role
    )
    db.add(user)
    db.flush()

    if user_in.role == UserRole.FARMER:
        fp = FarmerProfile(
            user_id=user.id,
            farm_name=user_in.farm_name or f"{user_in.full_name}'s Farm",
            is_fpo=user_in.is_fpo or False,
            member_count=user_in.member_count or 1,
            district=user_in.district or "Coimbatore",
            state=user_in.state or "Tamil Nadu"
        )
        db.add(fp)

    elif user_in.role == UserRole.BUYER:
        bp = BuyerProfile(
            user_id=user.id,
            buyer_type=user_in.buyer_type,
            delivery_address=user_in.delivery_address or "Coimbatore, Tamil Nadu",
            district=user_in.district or "Coimbatore",
            state=user_in.state or "Tamil Nadu"
        )
        db.add(bp)

    elif user_in.role == UserRole.LOGISTICS:
        lp = LogisticsProfile(
            user_id=user.id,
            vehicle_type=user_in.vehicle_type or "Mini Truck (1.5 Ton)",
            vehicle_number=user_in.vehicle_number or "TN-37-AZ-9988",
            current_district=user_in.district or "Coimbatore"
        )
        db.add(lp)

    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": format_user_dict(user)
    }

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account suspended by administrator")

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": format_user_dict(user)
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return format_user_dict(current_user)

def format_user_dict(user: User):
    res = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "is_active": user.is_active
    }
    if user.farmer_profile:
        res["farmer_profile"] = {
            "id": user.farmer_profile.id,
            "farm_name": user.farmer_profile.farm_name,
            "is_fpo": user.farmer_profile.is_fpo,
            "member_count": user.farmer_profile.member_count,
            "verification_status": user.farmer_profile.verification_status.value if hasattr(user.farmer_profile.verification_status, 'value') else user.farmer_profile.verification_status,
            "district": user.farmer_profile.district,
            "state": user.farmer_profile.state
        }
    if user.buyer_profile:
        res["buyer_profile"] = {
            "id": user.buyer_profile.id,
            "buyer_type": user.buyer_profile.buyer_type.value if hasattr(user.buyer_profile.buyer_type, 'value') else user.buyer_profile.buyer_type,
            "business_name": user.buyer_profile.business_name,
            "delivery_address": user.buyer_profile.delivery_address,
            "district": user.buyer_profile.district,
            "state": user.buyer_profile.state
        }
    if user.logistics_profile:
        res["logistics_profile"] = {
            "id": user.logistics_profile.id,
            "vehicle_type": user.logistics_profile.vehicle_type,
            "vehicle_number": user.logistics_profile.vehicle_number,
            "max_capacity_kg": user.logistics_profile.max_capacity_kg,
            "current_district": user.logistics_profile.current_district
        }
    return res

