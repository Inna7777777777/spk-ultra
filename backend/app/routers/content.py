from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime
from ..core.auth import get_current_user, require_role, User
from ..models.schemas import Document, NewsItem

router = APIRouter(prefix="/content", tags=["content"])

_fake_docs: List[Document] = [
    Document(id=1, title="Устав СПК «Хорошово-1»", doc_type="устав", url="/docs/ustav.pdf", created_at=datetime.now()),
    Document(id=2, title="Протокол общего собрания 01.05.2025", doc_type="протокол", url="/docs/protocol-2025-05-01.pdf", created_at=datetime.now()),
]

_fake_news: List[NewsItem] = [
    NewsItem(id=1, title="Старт сезона 2025", text="Сезон открыт, въезд свободен с 01.05.2025.", created_at=datetime.now()),
    NewsItem(id=2, title="Отключение электроэнергии", text="Плановые работы 10.05 с 9:00 до 12:00.", created_at=datetime.now()),
]

@router.get("/docs", response_model=List[Document])
def list_docs(_: User = Depends(get_current_user)):
    return _fake_docs

@router.get("/news", response_model=List[NewsItem])
def list_news(_: User = Depends(get_current_user)):
    return _fake_news