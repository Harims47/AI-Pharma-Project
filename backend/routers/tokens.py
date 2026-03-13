from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.token import Token
from backend.schemas.token import TokenCreate, Token as TokenSchema

router = APIRouter(prefix="/tokens", tags=["Token System"])

@router.post("/", response_model=TokenSchema, status_code=status.HTTP_201_CREATED)
def create_token(token: TokenCreate, db: Session = Depends(get_db)):
    db_token = Token(**token.dict())
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

@router.get("/", response_model=List[TokenSchema])
def get_tokens(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Token).offset(skip).limit(limit).all()

@router.get("/{token_id}", response_model=TokenSchema)
def get_token(token_id: int, db: Session = Depends(get_db)):
    token = db.query(Token).filter(Token.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return token

@router.put("/{token_id}", response_model=TokenSchema)
def update_token_status(token_id: int, status: str, db: Session = Depends(get_db)):
    db_token = db.query(Token).filter(Token.id == token_id).first()
    if not db_token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    db_token.status = status
    db.commit()
    db.refresh(db_token)
    return db_token

@router.delete("/{token_id}")
def delete_token(token_id: int, db: Session = Depends(get_db)):
    db_token = db.query(Token).filter(Token.id == token_id).first()
    if not db_token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    db.delete(db_token)
    db.commit()
    return {"detail": "Token deleted"}
