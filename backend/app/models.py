from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    Text,
    Numeric,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    domain = Column(String, nullable=True)
    theme = Column(String, default="default")

    pages = relationship("Page", back_populates="site", cascade="all, delete-orphan")
    memberships = relationship("Membership", back_populates="site", cascade="all, delete-orphan")
    events = relationship("CalendarEvent", back_populates="site", cascade="all, delete-orphan")
    tariffs = relationship("Tariff", back_populates="site", cascade="all, delete-orphan")
    plots = relationship("Plot", back_populates="site", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="site", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="site", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_global_admin = Column(Boolean, default=False)
    phone = Column(String, nullable=True)

    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    plots_owned = relationship("Plot", back_populates="owner")
    documents_created = relationship("Document", back_populates="created_by")
    audit_logs = relationship("AuditLog", back_populates="user")
    created_polls = relationship("Poll", back_populates="created_by")
    votes = relationship("Vote", back_populates="user", cascade="all, delete-orphan")


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"))
    role = Column(String, default="member")  # admin, chair, board, audit, accountant, member

    user = relationship("User", back_populates="memberships")
    site = relationship("Site", back_populates="memberships")

    __table_args__ = (UniqueConstraint("user_id", "site_id", name="uq_user_site"),)


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    slug = Column(String, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    site = relationship("Site", back_populates="pages")

    __table_args__ = (
        UniqueConstraint("site_id", "slug", name="uq_site_slug"),
        Index("ix_pages_site_slug", "site_id", "slug"),
    )


class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    title = Column(String, nullable=False)
    date = Column(String, index=True)  # YYYY-MM-DD
    type = Column(String, default="info")  # meeting, payment, outage, other
    description = Column(Text, default="")

    site = relationship("Site", back_populates="events")

    __table_args__ = (Index("ix_events_site_date", "site_id", "date"),)


class ForumCategory(Base):
    __tablename__ = "forum_categories"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")

    topics = relationship("ForumTopic", back_populates="category", cascade="all, delete-orphan")


class ForumTopic(Base):
    __tablename__ = "forum_topics"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("forum_categories.id", ondelete="CASCADE"), index=True)
    title = Column(String, nullable=False)
    author_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("ForumCategory", back_populates="topics")
    posts = relationship("ForumPost", back_populates="topic", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_topics_category_created", "category_id", "created_at"),)


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("forum_topics.id", ondelete="CASCADE"), index=True)
    author_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("ForumTopic", back_populates="posts")


class Tariff(Base):
    __tablename__ = "tariffs"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    name = Column(String, nullable=False)
    category = Column(String, default="member_fee")  # member_fee, target, electricity, etc.
    year = Column(Integer, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    unit = Column(String, default="год / участок")
    is_active = Column(Boolean, default=True)

    site = relationship("Site", back_populates="tariffs")
    accruals = relationship("Accrual", back_populates="tariff", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_tariffs_site_year", "site_id", "year"),)


class Plot(Base):
    __tablename__ = "plots"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    number = Column(String, nullable=False)  # номер участка
    area = Column(Numeric(10, 2), nullable=True)
    cadastral_number = Column(String, nullable=True, index=True)
    owner_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    site = relationship("Site", back_populates="plots")
    owner = relationship("User", back_populates="plots_owned")

    __table_args__ = (
        UniqueConstraint("site_id", "number", name="uq_site_plot_number"),
        Index("ix_plots_site_number", "site_id", "number"),
    )


class Accrual(Base):
    __tablename__ = "accruals"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tariff_id = Column(Integer, ForeignKey("tariffs.id", ondelete="SET NULL"))
    year = Column(Integer, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String, default="pending")  # pending, paid, partial
    plot_id = Column(Integer, ForeignKey("plots.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tariff = relationship("Tariff", back_populates="accruals")
    plot = relationship("Plot")

    __table_args__ = (
        Index("ix_accruals_site_user_year", "site_id", "user_id", "year"),
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    accrual_id = Column(Integer, ForeignKey("accruals.id", ondelete="CASCADE"), index=True)
    paid_at = Column(DateTime, default=datetime.utcnow)
    amount = Column(Numeric(12, 2), nullable=False)
    method = Column(String, default="manual")  # sber_qr, sbp, etc.
    sber_order_id = Column(String, nullable=True)
    external_status = Column(String, default="created")  # created, paid, failed

    __table_args__ = (Index("ix_payments_accrual_paid", "accrual_id", "paid_at"),)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    category = Column(String, nullable=False)  # ustav, protocol, smeta, dogovor, act, other
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    file_path = Column(String, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="documents")
    created_by = relationship("User", back_populates="documents_created")

    __table_args__ = (
        Index("ix_documents_site_category", "site_id", "category"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)  # e.g. 'create_accrual', 'update_tariff'
    entity_type = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=True)
    data = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_site_created", "site_id", "created_at"),
    )


# --- Online voting (Poll / PollOption / Vote) and FeedbackTicket ---


class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    start_at = Column(DateTime, nullable=True)
    end_at = Column(DateTime, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="polls")
    created_by = relationship("User", back_populates="created_polls")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="poll", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_polls_site_active", "site_id", "is_active"),
    )


class PollOption(Base):
    __tablename__ = "poll_options"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id", ondelete="CASCADE"), index=True)
    text = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)

    poll = relationship("Poll", back_populates="options")
    votes = relationship("Vote", back_populates="option", cascade="all, delete-orphan")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    option_id = Column(Integer, ForeignKey("poll_options.id", ondelete="CASCADE"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    poll = relationship("Poll", back_populates="votes")
    user = relationship("User", back_populates="votes")
    option = relationship("PollOption", back_populates="votes")

    __table_args__ = (
        UniqueConstraint("poll_id", "user_id", name="uq_vote_poll_user"),
        Index("ix_votes_poll_option", "poll_id", "option_id"),
    )


class FeedbackTicket(Base):
    __tablename__ = "feedback_tickets"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="open")  # open / in_progress / closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    site = relationship("Site")
    user = relationship("User")

    __table_args__ = (
        Index("ix_feedback_site_status", "site_id", "status"),
    )
