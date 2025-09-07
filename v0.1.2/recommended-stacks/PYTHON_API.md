# Python API Stack

## Overview

A modern Python-based API stack optimized for building RESTful services, data processing pipelines, and machine learning endpoints. Emphasizes clean architecture, type safety, and performance.

## Philosophy

- **Type-First**: Full type hints for better tooling and safety
- **Async by Default**: High-performance async/await patterns
- **Data-Centric**: Excellent for data processing and ML workloads
- **Standards-Based**: OpenAPI, JSON Schema, OAuth2

## Core Technologies

### Framework & Runtime
- **Python 3.11+**: Modern Python with performance improvements
- **FastAPI**: High-performance async web framework
- **Pydantic**: Data validation and settings management
- **SQLAlchemy 2.0**: ORM with async support
- **Alembic**: Database migrations

### Data & Processing
- **PostgreSQL**: Primary database
- **Redis**: Caching and task queues
- **Celery**: Distributed task processing
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing

### API Features
- **OpenAPI**: Auto-generated documentation
- **OAuth2/JWT**: Authentication and authorization
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection
- **WebSocket**: Real-time features

### Development Tools
- **Poetry**: Dependency management
- **pytest**: Testing framework
- **mypy**: Static type checking
- **Black**: Code formatting
- **Ruff**: Fast linting

## Project Structure

```
project-root/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   └── router.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services/
│   │   └── user.py
│   ├── tasks/
│   │   └── email.py
│   └── main.py
├── alembic/
│   └── versions/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── docker/
│   └── Dockerfile
├── pyproject.toml
└── .env.example
```

## API Design

### FastAPI Application
```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    # Initialize connections
    await init_db()
    await init_cache()
```

### Endpoint Definition
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserResponse
from app.services.user import UserService
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Create a new user."""
    service = UserService(db)
    
    if await service.get_by_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user = await service.create(user_in)
    return UserResponse.from_orm(user)

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Get user by ID."""
    service = UserService(db)
    user = await service.get(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse.from_orm(user)
```

## Data Models

### SQLAlchemy Models
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Pydantic Schemas
```python
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator("password")
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        return v

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
```

## Authentication & Security

### JWT Implementation
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(
    subject: str, expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
```

### Dependency Injection
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await UserService(db).get(int(user_id))
    if user is None:
        raise credentials_exception
    
    return user
```

## Background Tasks

### Celery Integration
```python
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "app",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task
def send_email_task(email_to: str, subject: str, body: str):
    """Send email asynchronously."""
    from app.core.email import send_email
    send_email(email_to, subject, body)
    return f"Email sent to {email_to}"

@celery_app.task
def process_data_task(data_id: int):
    """Process data in background."""
    # Heavy computation here
    result = perform_analysis(data_id)
    save_results(data_id, result)
    return f"Processed data {data_id}"
```

## Testing

### pytest Configuration
```python
# conftest.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.main import app
from app.core.database import Base

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSession(engine) as session:
        yield session
```

### API Tests
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, db_session):
    response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "hashed_password" not in data
```

## Performance Optimization

### Async Database Queries
```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_with_posts(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.posts))
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def list_active(self, skip: int = 0, limit: int = 100) -> List[User]:
        result = await self.db.execute(
            select(User)
            .where(User.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
```

### Caching Strategy
```python
from functools import lru_cache
import aioredis
from app.core.config import settings

@lru_cache()
def get_redis_client():
    return aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )

async def get_cached_user(user_id: int) -> Optional[dict]:
    redis = get_redis_client()
    data = await redis.get(f"user:{user_id}")
    return json.loads(data) if data else None

async def cache_user(user: User, ttl: int = 3600):
    redis = get_redis_client()
    await redis.setex(
        f"user:{user.id}",
        ttl,
        json.dumps(UserResponse.from_orm(user).dict()),
    )
```

## Deployment

### Docker Configuration
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev

# Copy application
COPY . .

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

## Context7 Documentation

When using context7, fetch documentation for:
- **FastAPI**: Advanced features, middleware, WebSockets
- **Pydantic**: Validation, serialization, settings
- **SQLAlchemy**: Async ORM patterns, query optimization
- **Python**: asyncio, type hints, standard library
- **PostgreSQL**: Advanced queries, JSON operations
- **Redis**: Caching patterns, pub/sub
- **Celery**: Task queues, scheduling

## Best Practices

1. **Type Everything**: Use type hints for all functions and classes
2. **Async First**: Use async/await for all I/O operations
3. **Dependency Injection**: Use FastAPI's DI system consistently
4. **Error Handling**: Return proper HTTP status codes and messages
5. **Documentation**: Let FastAPI auto-generate OpenAPI docs
6. **Testing**: Aim for 80%+ test coverage
7. **Monitoring**: Use structured logging and APM tools