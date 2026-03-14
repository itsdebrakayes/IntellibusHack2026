from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import breach, scanner, analysis

app = FastAPI(
    title="BreachBuddy API",
    description="Your personal cyber safety hub — breach checks, link scanning, and email analysis.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(breach.router, prefix="/api/breach", tags=["Breach Check"])
app.include_router(scanner.router, prefix="/api/scan", tags=["Link Scanner"])
app.include_router(analysis.router, prefix="/api/analyze", tags=["Email Analysis"])

@app.get("/")
def root():
    return {"status": "BreachBuddy API is running"}
