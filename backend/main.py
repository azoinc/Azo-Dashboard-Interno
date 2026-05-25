from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from routers import health, query, interno_dashboard, sienge

app = FastAPI(
    title="Azo Dashboard API",
    description="Backend Python/FastAPI para o Dashboard Interno da Azo",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(query.router)
app.include_router(interno_dashboard.router)
app.include_router(sienge.router)


@app.get("/")
def root():
    return {"message": "Azo Dashboard API — OK"}
