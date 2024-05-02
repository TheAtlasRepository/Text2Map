import requests
from fastapi import APIRouter
from pexels_api import API

router = APIRouter()

PEXELS_API_KEY = "98vXBbwTDgKvItKOtKyel0qiZcgZsVHcXoI9pZaGnfZeDdvfkPtmEdux"

api = API(PEXELS_API_KEY)

@router.get("/imagesearch", response_model=dict)
def getImageSearch(query: str) -> str:
    """Gets and Image URL from Pexels API

    Args:
        query (str): The search query (e.g. "dog", "cat", "mountain")

    Returns:
        str: The URL of the image
    """
    search = api.search(query, results_per_page=1)
    if search:
        return search["photos"][0]["src"]["landscape"]
    else:
        return None
