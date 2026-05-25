from fastapi import APIRouter
from db.connection import execute_query

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health_check():
    try:
        rows = execute_query("SELECT NOW() AS db_time")
        return {"status": "ok", "db_time": str(rows[0]["db_time"])}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}
