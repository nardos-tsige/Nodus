# =========================================================
# main.py
# The entry point for the FastAPI application.
# 
# This file:
#   1. Creates the FastAPI app
#   2. Sets up CORS (so React can talk to the backend)
#   3. Creates database tables (if they don't exist)
#   4. Registers all routers (topics, resources, notes)
#   5. Defines auth endpoints (register and login)
# =========================================================

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select
from datetime import datetime
import os

from .database import engine, get_session
from .models import User, Token, UserCreate, UserRead
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from .routers import topics, resources, notes

# =========================================================
# DATABASE SETUP
# =========================================================

# Create tables if they don't exist
print("Creating database tables...")
SQLModel.metadata.create_all(engine)
print("Database tables created successfully!")

# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Nodus - Learning Tracker API",
    description="Track your learning topics, resources, and notes",
    version="1.0.0",
)

# =========================================================
# CORS - Allows React frontend to talk to this backend
# =========================================================

# Get frontend URL from environment or use defaults
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://nodus.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        FRONTEND_URL,
        f"{FRONTEND_URL}/*",
        "https://nodus.vercel.app",
        "https://nodus.vercel.app/*",
        "https://nodus-git-main.vercel.app",
        "https://nodus-git-*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# REGISTER ROUTERS
# =========================================================

app.include_router(topics.router)
app.include_router(resources.router)
app.include_router(notes.router)

# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to Nodus API!",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# =========================================================
# AUTH ENDPOINTS
# =========================================================

@app.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    session: Session = Depends(get_session),
):
    """
    Register a new user account.
    
    - Checks if email already exists
    - Hashes password
    - Creates user in database
    - Returns a JWT token for immediate login
    """
    print(f"Registering user: {user_data.email}")
    
    # Check if email already exists
    existing = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    
    if existing:
        print(f"Email {user_data.email} already exists!")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    print("Email is unique, creating user...")
    
    # Create new user
    hashed = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed,
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    print(f"User created with ID: {user.id}")
    
    # Create and return token
    token = create_access_token(data={"sub": str(user.id)})
    print(f"Token created for user {user.id}")
    
    return Token(access_token=token, token_type="bearer")


@app.post("/auth/login", response_model=Token)
def login(
    user_data: UserCreate,
    session: Session = Depends(get_session),
):
    """
    Log in an existing user.
    
    - Finds user by email
    - Verifies password
    - Returns a JWT token
    """
    print(f"Login attempt: {user_data.email}")
    
    # Find user by email
    user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    
    # Check if user exists AND password matches
    if not user or not verify_password(user_data.password, user.hashed_password):
        print(f"Login failed for {user_data.email}: invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Login successful for {user_data.email}")
    
    # Create and return token
    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token, token_type="bearer")


@app.get("/auth/me", response_model=UserRead)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Get the currently logged-in user's information.
    Useful for testing authentication.
    """
    return current_user


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)