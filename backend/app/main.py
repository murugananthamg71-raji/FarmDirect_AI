from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, products, cart, orders, ai, logistics, reviews_reports, notifications, admin, dashboards

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from app.core.database import engine, Base, SessionLocal
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            from app.db.models import User
            if db.query(User).first() is None:
                from app.db.seed import seed_database
                seed_database()
        except Exception as seed_err:
            print("Auto-seed error:", seed_err)
        finally:
            db.close()
    except Exception as e:
        print("Startup DB error:", e)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="FarmDirect AI Direct-to-Consumer Agricultural Marketplace API (SIH26033)",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["Products"])
app.include_router(cart.router, prefix=f"{settings.API_V1_STR}/cart", tags=["Cart"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["Orders"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Engine"])
app.include_router(logistics.router, prefix=f"{settings.API_V1_STR}/logistics", tags=["Logistics"])
app.include_router(reviews_reports.router, prefix=f"{settings.API_V1_STR}", tags=["Reviews & Reports"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin & Impact"])
app.include_router(dashboards.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboards"])

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "ai_provider": settings.AI_PROVIDER
    }

