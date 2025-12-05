from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/events", response_model=List[schemas.CalendarEventRead])
def list_events(site_key: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    return db.query(models.CalendarEvent).filter(models.CalendarEvent.site_id == site.id).all()
