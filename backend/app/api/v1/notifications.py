from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import Notification, User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "user_id": n.user_id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else ""
        }
        for n in notifs
    ]

@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

