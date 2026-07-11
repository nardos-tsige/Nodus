# Nodus - Personal Learning Tracker

A full-stack web application for tracking your learning topics, resources, and notes.

## Backend Tech Stack
- **FastAPI** - Web framework
- **SQLModel** - ORM 
- **SQLite** - Database
- **JWT** - Authentication

## API Endpoints

**Auth**
- `POST /auth/register` - Create account
- `POST /auth/login` - Login

**Topics**
- `GET /topics` - Get all topics
- `POST /topics` - Create topic
- `GET /topics/{id}` - Get topic with details
- `PUT /topics/{id}` - Update topic
- `DELETE /topics/{id}` - Delete topic

**Resources**
- `POST /topics/{id}/resources` - Add resource
- `DELETE /resources/{id}` - Delete resource

**Notes**
- `POST /topics/{id}/notes` - Add note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload

Access API: http://localhost:8000/docs
