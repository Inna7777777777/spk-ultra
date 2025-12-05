from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, models
from ..deps import get_db, get_current_user
from ..audit_utils import log_audit

router = APIRouter(prefix="/billing", tags=["billing"])


def _get_site_by_key(db: Session, site_key: str) -> models.Site:
    site = db.query(models.Site).filter(models.Site.key == site_key).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    return site


@router.get("/tariffs", response_model=List[schemas.TariffRead])
def list_tariffs(site_key: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    site = _get_site_by_key(db, site_key)
    return db.query(models.Tariff).filter(models.Tariff.site_id == site.id).all()


@router.post("/tariffs", response_model=schemas.TariffRead)
def create_tariff(tariff_in: schemas.TariffCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    site = db.query(models.Site).filter(models.Site.id == tariff_in.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Сайт не найден")
    if not user.is_global_admin:
        membership = (
            db.query(models.Membership)
            .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
            .first()
        )
        if not membership or membership.role not in ("admin", "chair", "accountant"):
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    t = models.Tariff(**tariff_in.model_dump())
    db.add(t)
    db.flush()
    log_audit(
        db,
        site_id=site.id,
        user_id=user.id,
        action="create_tariff",
        entity_type="Tariff",
        entity_id=t.id,
        data=tariff_in.model_dump(),
    )
    db.commit()
    db.refresh(t)
    return t


@router.post("/accruals/generate", response_model=List[schemas.AccrualRead])
def generate_accruals(
    site_key: str,
    year: int,
    tariff_id: int,
    by_plots: bool = True,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Автоматическое начисление взносов.

    - Если by_plots = True: создаём по одному начислению на каждый участок (plot) сайта.
    - Если by_plots = False: создаём по одному начислению на каждого члена (Membership) сайта.
    """
    site = _get_site_by_key(db, site_key)
    tariff = db.query(models.Tariff).filter(models.Tariff.id == tariff_id, models.Tariff.site_id == site.id).first()
    if not tariff:
        raise HTTPException(status_code=404, detail="Тариф не найден")

    if not user.is_global_admin:
        membership = (
            db.query(models.Membership)
            .filter(models.Membership.user_id == user.id, models.Membership.site_id == site.id)
            .first()
        )
        if not membership or membership.role not in ("admin", "chair", "accountant"):
            raise HTTPException(status_code=403, detail="Недостаточно прав")

    created = []

    if by_plots:
        plots = db.query(models.Plot).filter(models.Plot.site_id == site.id).all()
        for p in plots:
            owner_user_id: Optional[int] = p.owner_user_id
            if owner_user_id is None:
                owner_user_id = user.id
            accrual = models.Accrual(
                site_id=site.id,
                user_id=owner_user_id,
                tariff_id=tariff.id,
                year=year,
                amount=tariff.amount,
                status="pending",
                plot_id=p.id,
            )
            db.add(accrual)
            db.flush()
            created.append(accrual)
    else:
        memberships = db.query(models.Membership).filter(models.Membership.site_id == site.id).all()
        for m in memberships:
            accrual = models.Accrual(
                site_id=site.id,
                user_id=m.user_id,
                tariff_id=tariff.id,
                year=year,
                amount=tariff.amount,
                status="pending",
                plot_id=None,
            )
            db.add(accrual)
            db.flush()
            created.append(accrual)

    log_audit(
        db,
        site_id=site.id,
        user_id=user.id,
        action="generate_accruals",
        entity_type="Accrual",
        entity_id=None,
        data={
            "year": year,
            "tariff_id": tariff_id,
            "by_plots": by_plots,
            "count_created": len(created),
        },
    )

    db.commit()
    return [schemas.AccrualRead.model_validate(a, from_attributes=True) for a in created]


@router.get("/accruals", response_model=List[schemas.AccrualRead])
def list_accruals(
    site_key: str,
    year: int | None = None,
    user_id: int | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = _get_site_by_key(db, site_key)
    q = db.query(models.Accrual).filter(models.Accrual.site_id == site.id)
    if year:
        q = q.filter(models.Accrual.year == year)
    if user_id:
        q = q.filter(models.Accrual.user_id == user_id)
    return q.all()


@router.get("/accruals/my", response_model=List[schemas.AccrualRead])
def list_my_accruals(
    site_key: str,
    year: int | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    site = _get_site_by_key(db, site_key)
    q = db.query(models.Accrual).filter(models.Accrual.site_id == site.id, models.Accrual.user_id == user.id)
    if year:
        q = q.filter(models.Accrual.year == year)
    return q.all()


@router.post("/payments", response_model=schemas.PaymentRead)
def create_payment(
    payment_in: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    accrual = db.query(models.Accrual).filter(models.Accrual.id == payment_in.accrual_id).first()
    if not accrual:
        raise HTTPException(status_code=404, detail="Начисление не найдено")

    payment = models.Payment(**payment_in.model_dump())
    db.add(payment)

    accrual.status = "paid"

    log_audit(
        db,
        site_id=accrual.site_id,
        user_id=user.id,
        action="create_payment",
        entity_type="Payment",
        entity_id=None,
        data=payment_in.model_dump(),
    )

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/payments", response_model=List[schemas.PaymentRead])
def list_payments(
    accrual_id: int | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    q = db.query(models.Payment)
    if accrual_id:
        q = q.filter(models.Payment.accrual_id == accrual_id)
    return q.all()


@router.get("/summary")
def billing_summary(
    site_key: str,
    year: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Сводка по начислениям и оплатам по сайту и году."""
    site = _get_site_by_key(db, site_key)
    q = db.query(models.Accrual).filter(models.Accrual.site_id == site.id, models.Accrual.year == year)
    total = 0
    total_paid = 0
    total_pending = 0
    count_all = 0
    count_paid = 0
    count_pending = 0

    for a in q.all():
        count_all += 1
        total += float(a.amount)
        if a.status == "paid":
            count_paid += 1
            total_paid += float(a.amount)
        else:
            count_pending += 1
            total_pending += float(a.amount)

    return {
        "site_key": site_key,
        "year": year,
        "total_accrued": total,
        "total_paid": total_paid,
        "total_pending": total_pending,
        "count_all": count_all,
        "count_paid": count_paid,
        "count_pending": count_pending,
    }
