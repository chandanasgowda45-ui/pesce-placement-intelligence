from fastapi import FastAPI

from app.routes.company import router as company_router

app = FastAPI(
    title="SRM Career Compass API",
    version="1.0.0"
)


@app.get("/")
async def root():
    return {
        "message": "API running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


app.include_router(company_router)