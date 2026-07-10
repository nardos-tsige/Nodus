from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from datetime import datetime

from ..database import get_session
from ..auth import get_current_user
from ..models import User, Topic, Note, NoteCreate, NoteUpdate, NoteRead

router = APIRouter(tags=["notes"])


# =========================================================
# POST /topics/{topic_id}/notes
# =========================================================
@router.post(
    "/topics/{topic_id}/notes",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    topic_id: int,
    note_data: NoteCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    topic = session.get(Topic, topic_id)
    if topic is None or topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Topic not found")

    new_note = Note(**note_data.dict(), topic_id=topic_id)

    session.add(new_note)
    session.commit()
    session.refresh(new_note)

    return new_note


# =========================================================
# PUT /notes/{note_id}
# edit the body of an existing note.
# =========================================================
@router.put("/notes/{note_id}", response_model=NoteRead)
def update_note(
    note_id: int,
    updates: NoteUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    note = session.get(Note, note_id)
    if note is None or note.topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    note.body = updates.body
    note.updated_at = datetime.utcnow()

    session.add(note)
    session.commit()
    session.refresh(note)

    return note


# =========================================================
# DELETE /notes/{note_id}
# =========================================================
@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    note = session.get(Note, note_id)
    if note is None or note.topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    session.delete(note)
    session.commit()