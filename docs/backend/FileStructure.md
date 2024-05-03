# Backend File Structure

We chose to use a very simple structure of having the `main.py` with the `Dockerfile` in root, and having the api points like `/askchat` under the routers folder. 

Since the backend depends on alot of 3rd party packages and isnt too big in size, it seemed sufficent to have it structured like this.

```cmd
c://backend
|   Dockerfile
|   main.py
|   pyproject.toml
|   requirements.txt
|
\---routers
        askchat.py
        imageSearch.py
```
