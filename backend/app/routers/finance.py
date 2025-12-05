from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime, timedelta
from ..core.auth import get_current_user, require_role, User
from ..models.schemas import Payment, Debt, Receipt

router = APIRouter(prefix="/finance", tags=["finance"])

_fake_payments: List[Payment] = [
    Payment(id=1, user_id=1, amount=5000, purpose="Членский взнос 2025", created_at=datetime.now(), paid=True),
    Payment(id=2, user_id=1, amount=1500, purpose="Электроэнергия май 2025", created_at=datetime.now(), paid=False),
]

_fake_debts: List[Debt] = [
    Debt(id=1, user_id=1, amount=1500, reason="Электроэнергия май 2025", due_date=datetime.now() + timedelta(days=10)),
]

_fake_receipts: List[Receipt] = [
    Receipt(
        id=1,
        user_id=1,
        amount=5000,
        purpose="Членский взнос 2025",
        period="2025",
        qr_data="ST00012|Name=СПК Хорошово-1|Sum=500000|Purpose=Членский взнос 2025",
        created_at=datetime.now(),
    )
]

@router.get("/my/payments", response_model=List[Payment])
def my_payments(current: User = Depends(get_current_user)):
    return [p for p in _fake_payments if p.user_id == 1]

@router.get("/my/debts", response_model=List[Debt])
def my_debts(current: User = Depends(get_current_user)):
    return [d for d in _fake_debts if d.user_id == 1]

@router.get("/my/receipts", response_model=List[Receipt])
def my_receipts(current: User = Depends(get_current_user)):
    return [r for r in _fake_receipts if r.user_id == 1]

@router.get("/all/debts", response_model=List[Debt])
def all_debts(_: User = Depends(require_role("chairman", "accountant", "admin"))):
    return _fake_debts