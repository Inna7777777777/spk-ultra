from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/", response_model=List[schemas.DocumentRead])
def list_documents(
    site_key: str,
    category: str | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    q = db.query(models.Document).filter(models.Document.site_id == site.id)
    if category:
        q = q.filter(models.Document.category == category)
    return q.all()


@router.post("/", response_model=schemas.DocumentRead)
def create_document(
    doc_in: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.id == doc_in.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    if not user.is_global_admin:
        membership = (
            db.query(models.Membership)
            .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
            .first()
        )
        if not membership or membership.role not in ("admin", "chair", "board"):
            raise HTTPException(status_code=403, detail="Недостаточно прав для загрузки документов")
    doc = models.Document(**doc_in.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
