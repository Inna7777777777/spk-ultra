from pydantic import BaseModel, EmailStr
from typing import Optional
from decimal import Decimal


class SiteBase(BaseModel):
    key: str
    name: str
    domain: Optional[str] = None
    theme: str = "default"


class SiteCreate(SiteBase):
    pass


class SiteRead(SiteBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    is_active: bool = True
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str
    is_global_admin: bool = False


class UserRead(UserBase):
    id: int
    is_global_admin: bool

    class Config:
        from_attributes = True


class MembershipBase(BaseModel):
    user_id: int
    site_id: int
    role: str = "member"


class MembershipCreate(MembershipBase):
    pass


class MembershipRead(MembershipBase):
    id: int

    class Config:
        from_attributes = True


class PageBase(BaseModel):
    slug: str
    title: str
    content: str = ""
    is_public: bool = True
    site_id: int


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None


class PageRead(PageBase):
    id: int

    class Config:
        from_attributes = True


class CalendarEventBase(BaseModel):
    site_id: int
    title: str
    date: str
    type: str = "info"
    description: str = ""


class CalendarEventCreate(CalendarEventBase):
    pass


class CalendarEventRead(CalendarEventBase):
    id: int

    class Config:
        from_attributes = True


class ForumCategoryBase(BaseModel):
    site_id: int
    title: str
    description: str = ""


class ForumCategoryCreate(ForumCategoryBase):
    pass


class ForumCategoryRead(ForumCategoryBase):
    id: int

    class Config:
        from_attributes = True


class ForumTopicBase(BaseModel):
    category_id: int
    title: str
    author_name: str


class ForumTopicCreate(ForumTopicBase):
    pass


class ForumTopicRead(ForumTopicBase):
    id: int

    class Config:
        from_attributes = True


class ForumPostBase(BaseModel):
    topic_id: int
    author_name: str
    content: str


class ForumPostCreate(ForumPostBase):
    pass


class ForumPostRead(ForumPostBase):
    id: int

    class Config:
        from_attributes = True


class TariffBase(BaseModel):
    site_id: int
    name: str
    category: str = "member_fee"
    year: int
    amount: Decimal
    unit: str = "год / участок"
    is_active: bool = True


class TariffCreate(TariffBase):
    pass


class TariffRead(TariffBase):
    id: int

    class Config:
        from_attributes = True


class PlotBase(BaseModel):
    site_id: int
    number: str
    area: Optional[Decimal] = None
    cadastral_number: Optional[str] = None
    owner_user_id: Optional[int] = None


class PlotCreate(PlotBase):
    pass


class PlotRead(PlotBase):
    id: int

    class Config:
        from_attributes = True


class AccrualBase(BaseModel):
    site_id: int
    user_id: int
    tariff_id: Optional[int]
    year: int
    amount: Decimal
    status: str = "pending"
    plot_id: Optional[int] = None


class AccrualCreate(AccrualBase):
    pass


class AccrualRead(AccrualBase):
    id: int

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    accrual_id: int
    amount: Decimal
    method: str = "manual"
    sber_order_id: Optional[str] = None
    external_status: str = "created"


class PaymentCreate(PaymentBase):
    pass


class PaymentRead(PaymentBase):
    id: int

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    site_id: int
    category: str
    title: str
    description: str = ""
    file_path: str
    created_by_id: Optional[int] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentRead(DocumentBase):
    id: int

    class Config:
        from_attributes = True


class AuditLogBase(BaseModel):
    site_id: int
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    data: str = ""


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogRead(AuditLogBase):
    id: int

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# --- Online voting & feedback ---


class PollOptionBase(BaseModel):
    text: str
    sort_order: int = 0


class PollOptionCreate(PollOptionBase):
    pass


class PollOptionRead(PollOptionBase):
    id: int

    class Config:
        from_attributes = True


class PollBase(BaseModel):
    site_id: int
    title: str
    description: str = ""
    is_anonymous: bool = False
    is_active: bool = True


class PollCreate(PollBase):
    start_at: Optional[str] = None  # ISO datetime
    end_at: Optional[str] = None
    options: list[PollOptionBase]


class PollRead(PollBase):
    id: int
    created_by_user_id: Optional[int] = None
    start_at: Optional[str] = None
    end_at: Optional[str] = None

    class Config:
        from_attributes = True


class VoteCreate(BaseModel):
    poll_id: int
    option_id: int


class VoteRead(BaseModel):
    id: int
    poll_id: int
    user_id: int
    option_id: int

    class Config:
        from_attributes = True


class FeedbackTicketBase(BaseModel):
    site_id: int
    subject: str
    message: str


class FeedbackTicketCreate(FeedbackTicketBase):
    pass


class FeedbackTicketRead(FeedbackTicketBase):
    id: int
    user_id: Optional[int] = None
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True
