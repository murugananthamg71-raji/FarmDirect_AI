from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import Review, Report, Order, OrderItem, OrderStatus, Product, User, UserRole
from app.api.deps import get_current_user, require_roles

router = APIRouter()

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: str

class ReportCreate(BaseModel):
    product_id: int
    reason: str
    details: str

@router.get("/products/{product_id}/reviews")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    res = []
    for r in reviews:
        res.append({
            "id": r.id,
            "product_id": r.product_id,
            "buyer_id": r.buyer_id,
            "buyer_name": r.buyer.full_name if r.buyer else "Buyer",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
    return res

@router.post("/reviews")
def create_review(
    req: ReviewCreate,
    current_user: User = Depends(require_roles([UserRole.BUYER])),
    db: Session = Depends(get_db)
):
    # Verify delivered order exists for this product
    delivered_order = db.query(Order).join(OrderItem).filter(
        Order.buyer_id == current_user.id,
        Order.status == OrderStatus.DELIVERED,
        OrderItem.product_id == req.product_id
    ).first()

    if not delivered_order:
        raise HTTPException(
            status_code=400,
            detail="Reviews are restricted to buyers who have a confirmed DELIVERED order for this product."
        )

    # Prevent duplicate reviews
    existing = db.query(Review).filter(Review.product_id == req.product_id, Review.buyer_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review for this product.")

    review = Review(
        product_id=req.product_id,
        buyer_id=current_user.id,
        rating=max(1, min(5, req.rating)),
        comment=req.comment
    )
    db.add(review)
    db.commit()
    return {"message": "Review submitted successfully"}

@router.post("/reports")
def create_report(
    req: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = Report(
        reporter_id=current_user.id,
        product_id=req.product_id,
        reason=req.reason,
        details=req.details
    )
    db.add(report)
    db.commit()
    return {"message": "Report submitted to admin moderation queue"}

