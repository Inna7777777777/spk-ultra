from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..core.auth import get_current_user, require_role, User
from ..models.schemas import Poll, VoteOption

router = APIRouter(prefix="/polls", tags=["polls"])

_fake_polls: List[Poll] = [
    Poll(
        id=1,
        question="Согласны ли вы с установкой шлагбаума на въезде?",
        options=[
            VoteOption(id=1, text="Да", votes=10),
            VoteOption(id=2, text="Нет", votes=3),
        ],
        is_active=True,
    )
]

@router.get("/", response_model=List[Poll])
def list_polls(_: User = Depends(get_current_user)):
    return _fake_polls

@router.post("/{poll_id}/vote/{option_id}")
def vote(poll_id: int, option_id: int, _: User = Depends(get_current_user)):
    for poll in _fake_polls:
        if poll.id == poll_id:
            for opt in poll.options:
                if opt.id == option_id:
                    opt.votes += 1
                    return {"status": "ok"}
            raise HTTPException(status_code=404, detail="Вариант не найден")
    raise HTTPException(status_code=404, detail="Голосование не найдено")

@router.post("/")
def create_poll(poll: Poll, _: User = Depends(require_role("chairman", "board", "admin"))):
    _fake_polls.append(poll)
    return {"status": "created", "id": poll.id}