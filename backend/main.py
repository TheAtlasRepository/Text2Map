import uvicorn
import dotenv
import argparse
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import askchat, imageSearch # Adjust the import based on your actual router module

# Initialize FastAPI application at the module level
app = FastAPI(
    title="Text/CSV 2 Map API",
    description="API for converting text or CSV data into a map visualization",
)

def main():
    # Load the environment variables
    port = 8000
    host = "0.0.0.0"
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", '--port', type=int, help='Port to run the server on')
    parser.add_argument("-M", '--mode', type=str, help="Mode to run the server in, either 'dev' or 'prod'", default='dev')
    args = parser.parse_args()
    if args.port:
        port = args.port
        print(f"Running server on port {port}")
    else:
        if dotenv.load_dotenv():
            print("Environment variables loaded")
            # Get the port from the environment variables
            port = dotenv.get_key('./.env', key_to_get='HOST_PORT')
            try:
                port = int(port)
            except:
                pass

    # Configure CORS settings
    origins = [
        "http://localhost", # For local testing
        "http://localhost:8080", # For Vue dev server
        "http://localhost:3000", # For React dev server
    ]
    if dotenv.load_dotenv('./.env'):
        print("Environment variables loaded")
        try:
            origins = dotenv.get_key('./.env', key_to_get='CORS_ORIGINS')
            origins = origins.split(',')
        except:
            print("Error getting CORS_ORIGINS from environment variables")
            pass

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

    print("Running in production mode")
    uvicorn.run(app, host=host, port=port)

if __name__ == '__main__':
    main()