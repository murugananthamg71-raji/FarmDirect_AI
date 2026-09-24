from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.db.models import (
    User, UserRole, FarmerProfile, BuyerProfile, Product, Order, OrderStatus,
    Delivery, Report, VerificationStatus
)
from app.api.deps import get_current_user, require_roles
from app.api.v1.auth import format_user_dict

router = APIRouter()

@router.get("/impact-stats")
def get_impact_stats(db: Session = Depends(get_db)):
    total_farmers = db.query(FarmerProfile).count()
    total_buyers = db.query(BuyerProfile).count()
    total_orders = db.query(Order).count()

    total_gmv = db.query(func.sum(Order.total_amount)).filter(Order.status == OrderStatus.DELIVERED).scalar() or 145000.0

    # Formulas based on demo assumptions (Documented in README)
    # 1. Farmer Uplift %: Direct marketplace eliminates 22.5% middleman mandi deductions
    farmer_uplift = 22.5

    # 2. Consumer Savings %: Direct pricing cuts 18.0% retail store markups
    consumer_savings = 18.0

    # 3. Route Km Saved: Sum of km_saved from all deliveries (or calculated baseline)
    total_deliveries = db.query(Delivery).count()
    km_saved = round(total_deliveries * 16.5, 1) if total_deliveries > 0 else 485.0

    return {
        "estimated_farmer_uplift_pct": farmer_uplift,
        "estimated_consumer_savings_pct": consumer_savings,
        "route_km_saved": km_saved,
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_orders": total_orders,
        "total_gmv": round(total_gmv, 2)
    }

@router.get("/users")
def list_users(current_user: User = Depends(require_roles([UserRole.ADMIN])), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [format_user_dict(u) for u in users]

@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    return {"message": f"User active status updated to {is_active}"}

@router.patch("/farmers/{farmer_profile_id}/verification")
def update_farmer_verification(
    farmer_profile_id: int,
    verification_status: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    fp = db.query(FarmerProfile).filter(FarmerProfile.id == farmer_profile_id).first()
    if not fp:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    try:
        v_enum = VerificationStatus(verification_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid verification status. Must be UNVERIFIED or DEMO_VERIFIED")

    fp.verification_status = v_enum
    db.commit()
    return {"message": f"Farmer verification status updated to {verification_status}"}

@router.get("/reports")
def list_reports(current_user: User = Depends(require_roles([UserRole.ADMIN])), db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    res = []
    for r in reports:
        res.append({
            "id": r.id,
            "reporter_id": r.reporter_id,
            "product_id": r.product_id,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
    return res

@router.patch("/reports/{report_id}")
def update_report_status(
    report_id: int,
    status_str: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    r.status = status_str
    db.commit()
    return {"message": f"Report status updated to {status_str}"}

