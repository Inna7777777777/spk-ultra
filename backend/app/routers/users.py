from fastapi import APIRouter, Depends
from typing import List
from ..core.auth import get_current_user, require_role, User
from ..models.schemas import UserBase

router = APIRouter(prefix="/users", tags=["users"])

fake_users = [
    UserBase(id=1, fio="Иванов Иван Иванович", plot_number="1", role="gardener"),
    UserBase(id=2, fio="Петров Пётр Петрович", plot_number="2", role="gardener"),
    UserBase(id=3, fio="Сидоров Сергей Сергеевич", plot_number="3", role="gardener"),
    UserBase(id=100, fio="Председатель СНТ", plot_number="", role="chairman"),
]

@router.get("/me", response_model=UserBase)
def me(current: User = Depends(get_current_user)):
    for u in fake_users:
        if u.role == current.role and u.fio.startswith(current.username):
            return u
    return UserBase(id=999, fio=current.username, plot_number=None, role=current.role)

@router.get("/", response_model=List[UserBase])
def list_users(_: User = Depends(require_role("chairman", "board", "accountant", "admin"))):
    return fake_users