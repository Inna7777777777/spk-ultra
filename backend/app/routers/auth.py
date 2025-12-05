from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    role: str

@router.post("/login")
def login(data: LoginRequest):
    if data.role not in ["gardener", "chairman", "board", "audit", "accountant", "admin"]:
        raise HTTPException(status_code=400, detail="Неизвестная роль")
    return {"access_token": f"{data.role}:{data.username}", "token_type": "bearer"}