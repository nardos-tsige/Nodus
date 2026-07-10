from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# =========================================================
# AUTH SCHEMAS
# =========================================================

class Token(SQLModel):
    """JWT token response for login/register"""
    access_token: str
    token_type: str = "bearer"


class UserCreate(SQLModel):
    """What the client sends to register"""
    email: str
    password: str


class UserRead(SQLModel):
    """What the API returns when showing user info"""
    id: int
    email: str
    created_at: datetime


# =========================================================
# USER
# =========================================================

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)


class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # cascade="all, delete-orphan": if a User row is deleted,
    # SQLAlchemy automatically deletes all of their Topics too --
    # no orphaned rows left pointing at a user that no longer exists.
    topics: List["Topic"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime


# =========================================================
# TOPIC
# =========================================================

class TopicBase(SQLModel):
    title: str
    description: Optional[str] = None
    status: str = Field(default="not_started")
    # allowed values, enforced in the router:
    # "not_started" | "in_progress" | "complete"


class Topic(TopicBase, table=True):
    __tablename__ = "topics"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner: Optional[User] = Relationship(back_populates="topics")

    resources: List["Resource"] = Relationship(
        back_populates="topic",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    notes: List["Note"] = Relationship(
        back_populates="topic",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class TopicCreate(TopicBase):
    pass


class TopicUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class TopicRead(TopicBase):
    id: int
    created_at: datetime
    updated_at: datetime


class TopicReadWithDetails(TopicRead):
    resources: List["ResourceRead"] = []
    notes: List["NoteRead"] = []


# =========================================================
# RESOURCE
# =========================================================

class ResourceBase(SQLModel):
    url: str
    label: str


class Resource(ResourceBase, table=True):
    __tablename__ = "resources"

    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topics.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    topic: Optional[Topic] = Relationship(back_populates="resources")


class ResourceCreate(ResourceBase):
    pass


class ResourceRead(ResourceBase):
    id: int
    topic_id: int
    created_at: datetime


# =========================================================
# NOTE
# =========================================================

class NoteBase(SQLModel):
    body: str


class Note(NoteBase, table=True):
    __tablename__ = "notes"

    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topics.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    topic: Optional[Topic] = Relationship(back_populates="notes")


class NoteCreate(NoteBase):
    pass


class NoteUpdate(SQLModel):
    body: str


class NoteRead(NoteBase):
    id: int
    topic_id: int
    created_at: datetime
    updated_at: datetime

# -----------------------------------------------------------
# This line resolves the forward references used above, e.g.
# List["Resource"] and List["ResourceRead"] written as strings
# because Resource/ResourceRead are defined further down the
# file than where User/TopicReadWithDetails reference them.
# Calling update_forward_refs() lets SQLModel go back and wire
# those string references up to the real classes now that every
# class in this file has been defined.
# -----------------------------------------------------------
TopicReadWithDetails.update_forward_refs()