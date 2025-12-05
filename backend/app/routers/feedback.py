
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=schemas.FeedbackTicketRead)
def create_ticket(
    ticket_in: schemas.FeedbackTicketCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # пользователь может быть анонимным (если позже добавим публичную форму),
    # но сейчас предполагаем, что он залогинен
    t = models.FeedbackTicket(
        site_id=ticket_in.site_id,
        user_id=user.id,
        subject=ticket_in.subject,
        message=ticket_in.message,
        status="open",
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return schemas.FeedbackTicketRead.model_validate(t, from_attributes=True)


@router.get("/my", response_model=List[schemas.FeedbackTicketRead])
def my_tickets(
    site_key: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    q = (
        db.query(models.FeedbackTicket)
        .filter(models.FeedbackTicket.site_id == site.id, models.FeedbackTicket.user_id == user.id)
        .order_by(models.FeedbackTicket.created_at.desc())
    )
    tickets = q.all()
    return [schemas.FeedbackTicketRead.model_validate(t, from_attributes=True) for t in tickets]


@router.get("/admin", response_model=List[schemas.FeedbackTicketRead])
def list_tickets_admin(
    site_key: str,
    status: str = "open",
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")

    # права: председатель, правление, ревком, бухгалтер, админ
    if not user.is_global_admin:
        membership = (
            db.query(models.Membership)
            .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
            .first()
        )
        allowed_roles = ("admin", "chair", "board", "audit", "accountant")
        if not membership or membership.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Нет прав для просмотра обращений садоводов")

    q = db.query(models.FeedbackTicket).filter(models.FeedbackTicket.site_id == site.id)
    if status:
        q = q.filter(models.FeedbackTicket.status == status)
    tickets = q.order_by(models.FeedbackTicket.created_at.desc()).all()
    return [schemas.FeedbackTicketRead.model_validate(t, from_attributes=True) for t in tickets]
