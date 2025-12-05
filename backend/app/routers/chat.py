from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime
from ..core.auth import get_current_user, User
from ..models.schemas import ChatMessage

router = APIRouter(prefix="/chat", tags=["chat"])

_fake_chat: List[ChatMessage] = [
    ChatMessage(id=1, author="Иванов", text="Добрый день, соседи!", created_at=datetime.now()),
    ChatMessage(id=2, author="Председатель", text="Напоминаю про оплату взносов до 01.06.", created_at=datetime.now()),
]

@router.get("/messages", response_model=List[ChatMessage])
def get_messages(_: User = Depends(get_current_user)):
    return _fake_chat