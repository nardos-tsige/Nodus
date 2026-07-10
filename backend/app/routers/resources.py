from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..database import get_session
from ..auth import get_current_user
from ..models import User, Topic, Resource, ResourceCreate, ResourceRead

router = APIRouter(tags=["resources"])

# =========================================================
# POST /topics/{topic_id}/resources
# add a resource to a topic the current user owns.
# =========================================================
@router.post(
    "/topics/{topic_id}/resources",
    response_model=ResourceRead,
    status_code=status.HTTP_201_CREATED,
)
def create_resource(
    topic_id: int,
    resource_data: ResourceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    
    topic = session.get(Topic, topic_id)
    if topic is None or topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Topic not found")

    new_resource = Resource(**resource_data.dict(), topic_id=topic_id)

    session.add(new_resource)
    session.commit()
    session.refresh(new_resource)

    return new_resource

# =========================================================
# DELETE /resources/{resource_id}
# =========================================================
@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    if resource.topic.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resource not found")

    session.delete(resource)
    session.commit()