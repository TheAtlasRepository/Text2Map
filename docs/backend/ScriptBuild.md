# Running the backend

There are two ways of starting the backend-server through the use of a terminal:

- The main way is with the command `uvicorn main:app --reload`. This start up a uvicorn server running the main app, and will reload when changes to the code are made.

- The other way is with `python main.py` which also starts up the uvicorn server.

> [!NOTE]
> The uvicorn server will by default be hosted at `0.0.0.0:8000/` or `localhost:8000/`.

Technically you can run uvicorn with workers too, but the perfomance boost or utility of this seems to be none as our system is not made to utilize this to its full potential.