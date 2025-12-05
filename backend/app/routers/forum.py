from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime
from ..core.auth import get_current_user, require_role, User
from ..models.schemas import ForumTopic, ForumMessage

router = APIRouter(prefix="/forum", tags=["forum"])

_fake_topics: List[ForumTopic] = [
    ForumTopic(id=1, title="Дороги и отсыпка", author="Иванов", created_at=datetime.now()),
    ForumTopic(id=2, title="Электросети и счётчики", author="Петров", created_at=datetime.now()),
]

_fake_messages: List[ForumMessage] = [
    ForumMessage(id=1, topic_id=1, author="Иванов", text="Нужно подсыпать центральную дорогу.", created_at=datetime.now()),
    ForumMessage(id=2, topic_id=1, author="Председатель", text="Внесём в план работ.", created_at=datetime.now()),
]

@router.get("/topics", response_model=List[ForumTopic])
def list_topics(_: User = Depends(get_current_user)):
    return _fake_topics

@router.get("/topics/{topic_id}/messages", response_model=List[ForumMessage])
def topic_messages(topic_id: int, _: User = Depends(get_current_user)):
    return [m for m in _fake_messages if m.topic_id == topic_id]