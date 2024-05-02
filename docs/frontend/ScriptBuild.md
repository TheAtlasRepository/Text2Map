# Running the frontend

To start the frontend of the project, run the command `yarn dev` in terminal. This starts up a nodejs server and runs the nextjs app on it. 

> [!NOTE]
> The frontend server will by default be hosted at `0.0.0.0:3000/` or `localhost:3000/`.

If a `.env.local` file is present in the frontend directory, the application will attempt to retrieve `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` from it to configure the server if no corresponding command line arguments are provided.

The content of `.env.local` should look something like this:
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=YourKeyHere NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
