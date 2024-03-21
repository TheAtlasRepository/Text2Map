from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers import askchat, imageSearch
import uvicorn

app = FastAPI()
router = APIRouter()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://frontend:3000",
    "http://frontend:8080",
    "http://frontend",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(askchat.router)
app.include_router(imageSearch.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, loop="asyncio")