from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/memberships", tags=["memberships"])


@router.get("/", response_model=List[schemas.MembershipRead])
def list_memberships(
    site_key: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    if not user.is_global_admin:
        membership = (
            db.query(models.Membership)
            .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
            .first()
        )
        if not membership or membership.role not in ("admin", "chair"):
            raise HTTPException(status_code=403, detail="Нет доступа к списку ролей сайта")
    return db.query(models.Membership).filter(models.Membership.site_id == site.id).all()


@router.post("/", response_model=schemas.MembershipRead)
def create_membership(
    membership_in: schemas.MembershipCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.id == membership_in.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    if not user.is_global_admin:
        membership_self = (
            db.query(models.Membership)
            .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
            .first()
        )
        if not membership_self or membership_self.role not in ("admin", "chair"):
            raise HTTPException(status_code=403, detail="Недостаточно прав для назначения ролей")
    membership = models.Membership(**membership_in.model_dump())
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership
