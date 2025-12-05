from fastapi import APIRouter, Depends
from typing import List
from ..core.auth import get_current_user, require_role, User
from ..models.schemas import Plot

router = APIRouter(prefix="/plots", tags=["plots"])

_fake_plots: List[Plot] = [
    Plot(id=1, number="1", area=6.0, owner_id=1),
    Plot(id=2, number="2", area=8.0, owner_id=2),
    Plot(id=3, number="3", area=4.5, owner_id=3),
]

@router.get("/my", response_model=List[Plot])
def my_plots(current: User = Depends(get_current_user)):
    return [p for p in _fake_plots if p.owner_id == 1]

@router.get("/", response_model=List[Plot])
def all_plots(_: User = Depends(require_role("chairman", "board", "admin"))):
    return _fake_plots