from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..auth import get_current_user
from ..models import (
    User,
    Topic,
    TopicCreate,
    TopicUpdate,
    TopicRead,
    TopicReadWithDetails,
)

router = APIRouter(prefix="/topics", tags=["topics"])


# =========================================================
# GET /topics
# return every topic that belongs to the logged-in user.
# =========================================================
@router.get("/", response_model=List[TopicRead])
def get_topics(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):

    statement = select(Topic).where(Topic.user_id == current_user.id)
    topics = session.exec(statement).all()
    return topics


# =========================================================
# POST /topics
# create a new topic owned by the logged-in user.
# =========================================================
@router.post("/", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
def create_topic(
    topic_data: TopicCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):

    new_topic = Topic(
        **topic_data.dict(),
        user_id=current_user.id,
    )

    session.add(new_topic)      # stage the new row
    session.commit()            # write it to nodus.db
    session.refresh(new_topic)  # pull back the DB-generated id/timestamps

    return new_topic


# =========================================================
# GET /topics/{topic_id}
# return one topic WITH its nested resources and notes.
# =========================================================
@router.get("/{topic_id}", response_model=TopicReadWithDetails)
def get_topic(
    topic_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    topic = _get_owned_topic_or_404(topic_id, session, current_user)
    return topic


# =========================================================
# PUT /topics/{topic_id}
# Update one or more fields on a topic (e.g. change status).
# =========================================================
@router.put("/{topic_id}", response_model=TopicRead)
def update_topic(
    topic_id: int,
    updates: TopicUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    topic = _get_owned_topic_or_404(topic_id, session, current_user)

    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(topic, field, value)


    from datetime import datetime
    topic.updated_at = datetime.utcnow()

    session.add(topic)
    session.commit()
    session.refresh(topic)

    return topic


# =========================================================
# DELETE /topics/{topic_id}
# delete a topic. thanks to cascade="all, delete-orphan" set
# up on the Topic model's relationships, this also deletes
# every Resource and Note attached to it automatically.
# =========================================================
@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    topic = _get_owned_topic_or_404(topic_id, session, current_user)
    session.delete(topic)
    session.commit()
    # 204 No Content responses must not return a body -- so we
    # simply return nothing.


# =========================================================
# Shared helper -- NOT an endpoint itself.
# every GET/PUT/DELETE on a single topic needs to do the exact
# same two checks: does this topic exist, and does it belong
# to the current user? Pulling that into one function means we
# only write (and fix bugs in) that logic once.
# =========================================================
def _get_owned_topic_or_404(
    topic_id: int,
    session: Session,
    current_user: User,
) -> Topic:
    topic = session.get(Topic, topic_id)

    # deliberately the SAME error for "doesn't exist" and
    # "exists but belongs to someone else." If we returned a
    # different error for "not yours," that would leak information
    # about which topic ids exist for other users.
    if topic is None or topic.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )
    return topic