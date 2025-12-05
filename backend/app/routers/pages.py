from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/pages", tags=["pages"])


def _check_site_access(user: models.User, site: models.Site, db: Session):
    membership = (
        db.query(models.Membership)
        .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
        .first()
    )
    if not membership and not user.is_global_admin:
        raise HTTPException(status_code=403, detail="Нет доступа к сайту")
    return membership


@router.get("/", response_model=List[schemas.PageRead])
def list_pages(
    site_key: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    _check_site_access(user, site, db)
    return db.query(models.Page).filter(models.Page.site_id == site.id).all()


@router.post("/", response_model=schemas.PageRead)
def create_page(
    page_in: schemas.PageCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = db.query(models.Site).filter(models.Site.id == page_in.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    membership = _check_site_access(user, site, db)
    if not (membership and membership.role in ("admin", "chair", "board")) and not user.is_global_admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав для создания страницы")
    page = models.Page(**page_in.model_dump())
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.get("/public/{site_key}/{slug}", response_model=schemas.PageRead)
def get_public_page(site_key: str, slug: str, db: Session = Depends(get_db)):
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    page = (
        db.query(models.Page)
        .filter(models.Page.site_id == site.id, models.Page.slug == slug, models.Page.is_public == True)  # noqa
        .first()
    )
    if not page:
        raise HTTPException(status_code=404, detail="Страница не найдена")
    return page
