from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("/", response_model=List[schemas.SiteRead])
def list_sites(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not user.is_global_admin:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    return db.query(models.Site).all()


@router.post("/", response_model=schemas.SiteRead)
def create_site(site_in: schemas.SiteCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not user.is_global_admin:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    existing = db.query(models.Site).filter(models.Site.key == site_in.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Сайт с таким ключом уже существует")
    site = models.Site(**site_in.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site
