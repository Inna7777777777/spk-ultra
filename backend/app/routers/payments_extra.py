from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from .. import models
from ..deps import get_db, get_current_user
from ..config import settings

router = APIRouter(prefix="/payments_extra", tags=["payments_extra"])


@router.get("/receipt/{accrual_id}")
def get_receipt(
    accrual_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
) -> Any:
    """Данные для квитанции по начислению.

    Это не реальный платёж через Сбер/СБП, а формирование реквизитов
    и строки для QR-кода (СБП / Сбер), которые можно распечатать или отсканировать.
    """
    accrual = db.query(models.Accrual).filter(models.Accrual.id == accrual_id).first()
    if not accrual:
        raise HTTPException(status_code=404, detail="Начисление не найдено")

    # Защита: пользователь может видеть только своё начисление,
    # либо председатель, бухгалтер, ревком, админ.
    if not user.is_global_admin:
        membership = (
            db.query(models.Membership)
            .filter(models.Membership.user_id == user.id, models.Membership.site_id == accrual.site_id)
            .first()
        )
        if accrual.user_id != user.id:
            if not membership or membership.role not in ("admin", "chair", "accountant", "audit"):
                raise HTTPException(status_code=403, detail="Нет прав доступа к квитанции")

    # Сопроводительная информация
    site = db.query(models.Site).filter(models.Site.id == accrual.site_id).first()
    tariff = db.query(models.Tariff).filter(models.Tariff.id == accrual.tariff_id).first()
    user_obj = db.query(models.User).filter(models.User.id == accrual.user_id).first()
    plot = None
    if accrual.plot_id:
        plot = db.query(models.Plot).filter(models.Plot.id == accrual.plot_id).first()

    amount_str = f"{float(accrual.amount):.2f}"

    # Простейший шаблон строки для СБП (QR): формат можно потом доработать под реальное ТЗ банка
    sbp_payload = f"PAYEE={settings.pay_receiver};INN={settings.pay_inn};ACCOUNT={settings.pay_account};AMOUNT={amount_str};PURPOSE=Взносы {site.name} {accrual.year}"

    # Можно использовать телефон для СБП (если банк так работает)
    if settings.pay_sbp_phone:
        sbp_payload += f";PHONE={settings.pay_sbp_phone}"

    # Обычная платёжная информация (для печати)
    receipt = {
        "receiver": settings.pay_receiver,
        "inn": settings.pay_inn,
        "kpp": settings.pay_kpp,
        "bank": settings.pay_bank,
        "bik": settings.pay_bik,
        "account": settings.pay_account,
        "corr_account": settings.pay_correspondent_account,
        "amount": amount_str,
        "purpose": f"Взносы {site.name} за {accrual.year} год (садовод {user_obj.full_name}, участок {plot.number if plot else '-'})",
        "site_name": site.name,
        "year": accrual.year,
        "tariff_name": tariff.name if tariff else None,
        "member_name": user_obj.full_name if user_obj else None,
        "plot_number": plot.number if plot else None,
        "sbp_payload": sbp_payload,
    }

    return receipt
