from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

# Raiz do projeto (dois níveis acima de backend/config/)
_PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Ordem de precedência: backend/.env (gerado por setup-env.ps1) > .env.local da raiz > backend/.env.local
_ENV_FILES = [
    str(_PROJECT_ROOT / "backend" / ".env"),
    str(_PROJECT_ROOT / ".env.local"),
    str(_PROJECT_ROOT / "backend" / ".env.local"),
]


class Settings(BaseSettings):
    # ── PostgreSQL direto (mesmo pool do server.ts) ───────────────────────────
    SP_HOST: str = ""
    SP_USER: str = ""
    SP_PS: str = ""
    SP_PORT: int = 5432
    SP_DB: str = "postgres"

    # ── Sienge ERP API ────────────────────────────────────────────────────────
    # Aceita tanto SIENGE_SUBDOMAIN quanto VITE_SIENGE_SUBDOMAIN
    SIENGE_SUBDOMAIN: str = ""
    VITE_SIENGE_SUBDOMAIN: str = ""
    SIENGE_USERNAME: str = ""
    VITE_SIENGE_API_USER: str = ""
    SIENGE_PASSWORD: str = ""
    VITE_SIENGE_API_PASSWORD: str = ""

    # ── Firebase Admin SDK ────────────────────────────────────────────────────
    FIREBASE_PROJECT_ID: str = ""
    VITE_FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_DATABASE_ID: str = "(default)"

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # ── Cache TTL em segundos ─────────────────────────────────────────────────
    CACHE_TTL_SECONDS: int = 300

    @property
    def sienge_subdomain(self) -> str:
        return self.SIENGE_SUBDOMAIN or self.VITE_SIENGE_SUBDOMAIN

    @property
    def sienge_username(self) -> str:
        return self.SIENGE_USERNAME or self.VITE_SIENGE_API_USER

    @property
    def sienge_password(self) -> str:
        return self.SIENGE_PASSWORD or self.VITE_SIENGE_API_PASSWORD

    @property
    def firebase_project_id(self) -> str:
        return self.FIREBASE_PROJECT_ID or self.VITE_FIREBASE_PROJECT_ID

    class Config:
        env_file = _ENV_FILES
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
