In the Backend folder you can run the server in multilple ways.

The main way is with ```uvicorn main:app --reload``` which start up a uvicorn server running the main app

The other way is with ```python main.py``` which also starts up the uvicorn server

Technically you can run uvicorn with workers too, but the perfomance boost or utility of this seems to be none as our system is not made to utilize this to its full potential.