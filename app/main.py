from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import breach, scanner, analysis, auth, user, media

app = FastAPI(
    title="Cyber Shield API",
    description="Your personal cyber safety hub.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://intellibus-hack2026.vercel.app",
        "https://intellibus-hack2026-8t8zuj58b-natecross123s-projects.vercel.app",
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(breach.router, prefix="/api/breach", tags=["Breach Check"])
app.include_router(scanner.router, prefix="/api/scan", tags=["Link Scanner"])
app.include_router(analysis.router, prefix="/api/analyze", tags=["Email Analysis"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(media.router, prefix="/api/media", tags=["Media Detection"])

@app.get("/")
async def root():
    return {"status": "API is running"}