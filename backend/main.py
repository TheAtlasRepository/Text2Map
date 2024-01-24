from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers import askchat

app = FastAPI()
router = APIRouter()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@router.get("/askchat")
def askchat_route():
    return askchat.askChat()

app.include_router(askchat.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
