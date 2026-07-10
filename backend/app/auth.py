from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from .database import get_session
from .models import User

SECRET_KEY = "change-this-to-a-long-random-string-before-deploying"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# =========================================================
# PASSWORD HELPERS
# =========================================================

def hash_password(plain_password: str) -> str:
    """Turn a plain text password into a bcrypt hash for storage."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check a login attempt's plain password against the stored hash.
    Returns True/False. This never "reverses" the hash -- bcrypt
    hashes a fresh copy of plain_password and compares hashes.
    """
    return pwd_context.verify(plain_password, hashed_password)


# =========================================================
# TOKEN CREATION
# =========================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Builds and signs a JWT.

    `data` is typically {"sub": str(user.id)} -- "sub" (subject)
    is the standard JWT field for "who is this token about."

    We copy the dict before mutating it so we don't accidentally
    change the caller's original dictionary.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# =========================================================
# TOKEN VERIFICATION -- "who is making this request?"
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    """
    A DEPENDENCY, just like get_session(). Any endpoint that adds
    `current_user: User = Depends(get_current_user)` to its
    parameters automatically requires a valid token AND gets the
    matching User object handed to it -- no manual token-checking
    code needed inside the endpoint itself.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # jwt.decode does three things at once: checks the
        # signature is valid for SECRET_KEY, checks the token
        # hasn't expired (via "exp"), and returns the payload.
        # If ANY of that fails, it raises JWTError.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # The token only proves WHICH user id made the request -- we
    # still have to look that user up to make sure the account
    # still exists (e.g. wasn't deleted after the token was issued).
    user = session.get(User, int(user_id))
    if user is None:
        raise credentials_exception

    return user