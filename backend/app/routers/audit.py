from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/audit", tags=["audit"])


def _get_site_and_check_access(db: Session, user, site_key: str) -> models.Site:
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    if user.is_global_admin:
        return site
    membership = (
        db.query(models.Membership)
        .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
        .first()
    )
    if not membership or membership.role not in ("admin", "chair", "audit"):
        raise HTTPException(status_code=403, detail="Нет прав доступа к данным ревкома")
    return site


@router.get("/logs")
def list_audit_logs(
    site_key: str,
    limit: int = 100,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = _get_site_and_check_access(db, user, site_key)
    q = (
        db.query(models.AuditLog)
        .filter(models.AuditLog.site_id == site.id)
        .order_by(models.AuditLog.created_at.desc())
        .limit(limit)
    )
    logs = []
    for row in q.all():
        logs.append(
            {
                "id": row.id,
                "action": row.action,
                "entity_type": row.entity_type,
                "entity_id": row.entity_id,
                "user_id": row.user_id,
                "data": row.data,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
        )
    return logs


@router.get("/accruals_report")
def accruals_report(
    site_key: str,
    year: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = _get_site_and_check_access(db, user, site_key)

    q = (
        db.query(
            models.Accrual,
            models.User.full_name.label("user_name"),
            models.Tariff.name.label("tariff_name"),
            models.Plot.number.label("plot_number"),
        )
        .join(models.User, models.User.id == models.Accrual.user_id)
        .join(models.Tariff, models.Tariff.id == models.Accrual.tariff_id, isouter=True)
        .join(models.Plot, models.Plot.id == models.Accrual.plot_id, isouter=True)
        .filter(models.Accrual.site_id == site.id, models.Accrual.year == year)
    )

    result = []
    for a, user_name, tariff_name, plot_number in q.all():
        result.append(
            {
                "id": a.id,
                "year": a.year,
                "amount": float(a.amount),
                "status": a.status,
                "user_id": a.user_id,
                "user_name": user_name,
                "tariff_id": a.tariff_id,
                "tariff_name": tariff_name,
                "plot_id": a.plot_id,
                "plot_number": plot_number,
            }
        )
    return result
