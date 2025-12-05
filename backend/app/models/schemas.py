from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    id: int
    fio: str
    plot_number: Optional[str] = None
    role: str

class Plot(BaseModel):
    id: int
    number: str
    area: float
    owner_id: int
    category: str = "садовый"

class Payment(BaseModel):
    id: int
    user_id: int
    amount: float
    purpose: str
    created_at: datetime
    paid: bool = False

class Debt(BaseModel):
    id: int
    user_id: int
    amount: float
    reason: str
    due_date: datetime

class Receipt(BaseModel):
    id: int
    user_id: int
    amount: float
    purpose: str
    period: str
    qr_data: str
    created_at: datetime

class VoteOption(BaseModel):
    id: int
    text: str
    votes: int = 0

class Poll(BaseModel):
    id: int
    question: str
    options: List[VoteOption]
    is_active: bool = True

class ForumTopic(BaseModel):
    id: int
    title: str
    author: str
    created_at: datetime

class ForumMessage(BaseModel):
    id: int
    topic_id: int
    author: str
    text: str
    created_at: datetime

class ChatMessage(BaseModel):
    id: int
    author: str
    text: str
    created_at: datetime

class Document(BaseModel):
    id: int
    title: str
    doc_type: str
    url: str
    created_at: datetime

class NewsItem(BaseModel):
    id: int
    title: str
    text: str
    created_at: datetime