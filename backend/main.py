from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers import askchat, imageSearch
import uvicorn

# Initialize FastAPI application at the module level
app = FastAPI()
router = APIRouter()

# Configure CORS settings
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000"
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(askchat.router)
app.include_router(imageSearch.router)

# Run UVicorn server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, loop="asyncio")
