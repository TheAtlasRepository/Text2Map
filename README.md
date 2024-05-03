# Text/CSV 2 Map

This application offers a simplistic way of visualising locations mentioned in text, or to visualice locations based on questions. 
This is done by creating interaktive pins on a map based on mentioned locations.

## Project requirements & development server startup:

**Requirements**
- **Install Miniconda:**
   Download and install Miniconda from [Miniconda website](https://docs.conda.io/en/latest/miniconda.html).

- **Acqurie a mapbox token**
   1. Create an account or sign in on this link [Mapbox Token](https://account.mapbox.com/access-tokens/)
   
   **If creating account**

   2. Press create account when prompted
   3. Verify your email

<p>&nbsp;</p>

## Automatic project setup (Windows)
**Locate the `startup.bat`** in the `\` (root) directory of the project. When you have located the file, you have three options depending on your case.

**Options**
1. If using *file explorer*, **click and start** the `startup.bat` file like any other program.

2. If using the terminal use the command `run startup.bat` This works using the built-in terminal within an IDE as well.
3. If using *Visual Studio Code* using an batch runner extension, select the script in the internal file explorer and run the file with the start button in the upper right corner, below `- [] x` in the application.

You are now done with the automatic startup, and will see two terminals appear, those are the local servers for front and backend respectively. After a small wait the browser will open two tabs: **The website itself** & **Backend API documentation**

> [!Note]
>When the script is running, during first time install: 
> 1. The script may exit if you don't have conda pre-installed
> 2. You may be prompted to provide the `Mapbox Default public token`, paste and press enter.
> 3. You may be prompted with one `y/n` in the terminal. Type `y` and press enter.
<p>&nbsp;</p>


## Automatic Project Setup (Linux & Mac)

This script automates the setup process for your project on Linux and Mac systems. It sets up your environment, installs dependencies, and starts your project.


### Locate the `startup.sh` Script

You need to locate the `startup.sh` script in the root directory of your project.

- Open Terminal: You can find it in the Applications folder or search for it using Spotlight (Command + Space).
- Navigate to the directory where your `startup.sh` script is located. For example, if it's in your project root directory, you can use the `cd` command:
- Make sure the script is executable: with `chmod +x startup.sh` 
- Run the script using the following command: `./startup.sh` 
- Follow the instructions prompted and it should run.
### Docker Setup

- You will need a .env file with your OPEN_API_KEY in the root of the project, like this: `OPENAI_API_KEY=`
- Also need a .env.local with your NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in the frontend folder. It should look something like this `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=`
- You run `docker-compose.yml` with docker-compose up --build. 
- Open localhost and it should be up and running.
<p>&nbsp;</p>
  
## Manual project setup in commandline
1. **Create a Conda Environment:**
    
    Please make sure to be in the directory you want to set the project up in!

   ```bash
    conda create --name YOUR_ENV_NAME

    conda activate YOUR_ENV_NAME

    conda install yarn

    conda install pip
   ```

2. **Set up OpenAI API-key**

   In Windows, search for **Edit the system environment variables**. In the new window, go to *Environment Variables*. Under *User variables for User*, click New.
   Fill out the following information:
   ```bash
   Variable name: OPENAI_API_KEY
   Variable value: *your OPENAI API key*
   ```
   Create an identical variable name and value under *System variables*.

   If you later get an error that the API key is not found, restart your shell and make sure everything is typed correctly.

3. **To run Backend**
   ```bash
   cd backend

   pip install -r requirements.txt

   uvicorn main:app --reload
   ```

> [!Note]
> Open a new terminal to progress, remember to acticate the conda conda environment in this terminal as well

4. **Set up Mapbox API key**
   In directory "frontend", create a file named `.env.local`.
   Add and modify the following line:
   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN='Your Mapbox Default public token'
   NEXT_PUBLIC_BACKEND_URL='Your Backend Url. http://localhost:8000 for example'
   ```

5. **To Run Frontend**
   ```bash
   cd frontend

   yarn install

   yarn dev
   ```
