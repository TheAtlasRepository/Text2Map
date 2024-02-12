# Text/CSV 2 Map

>>**TODO:** Add project discription

## Project requirements & development server startup:

**Requirements**
- **Install Miniconda:**
   Download and install Miniconda from [Miniconda website](https://docs.conda.io/en/latest/miniconda.html).

- **Acqurie a mapbox token**
   1. Create an account or sign in on this link [Mapbox Token](https://account.mapbox.com/access-tokens/)
   
   **If creating account**

   2. Press create account when prompted
   3. Verify your email
---
### Automatic project setup (Windows)
**Locate the `startup.bat`** in the `\` (root) directory of the project. When you have located the file, you have three options depending on your case.

**Options**
1. If using *file explorer*, **click and start** the `startup.bat` file like any other program.

2. If using the terminal use the command `run startup.bat` This works using the built-in terminal within an IDE as well.
3. If using *Visual Studio Code* using an batch runner extension, select the script in the internal file explorer and run the file with the start button in the upper right corner, below `- [] x` in the application.

>**Note:** When the script is running, during first time install: 
>> 1. The script may exit if you don't have conda pre-installed
>> 2. You may be prompted to provide the `Mapbox Default public token`, paste and press enter.
>> 3. You maybe prompted with one `y/n` in the terminal. Type `y` and press enter.

You are now done with the automatic startup, and will see two terminals appear, those are the local servers for front and backend respectively. After a small wait the browser will open two tabs: **The website itself** & **Backend API documentation**


### Manual project setup in commandline
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
   Variable  value: *your OPENAI API key*
   ```
   Create an identical variable name and value under *System variables*.

   If you later get an error that the API key is not found, restart your shell and make sure everything is typed correctly.

3. **To run Backend**
   ```bash
   cd backend

   pip install -r requirements.txt

   Install Spacy, large (560MB) OR small (12MB), large is recommended
   python -m spacy download en_core_web_lg
   OR
   python -m spacy download en_core_web_sm

   uvicorn main:app --reload
   ```

>  **Note:** Open a new terminal to progress, remember to acticate the conda conda environment in this terminal as well

4. **Set up Mapbox API key**
   In directory "frontend", create a file named `.env.local`.
   Add and modify the following line:
   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN='Your Mapbox Default public token'
   ```

5. **To Run Frontend**
   ```bash
   cd frontend

   yarn install

   yarn dev
   ```