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
**Locate the `startup.bat`** in the `\` (root) directory of the project. When you have located the file, you have three option depending on your case.

**Options**
1. If in *fileexplorer*, **click and start** the `startup.bat` file like any other program.

2. If in *IDE*, open the terminal and type `run startup.bat`
3. If in *VsCode* with batchscript runner, select the script in the internal fileexplorer, locate the play buttonin the upper right corner, below `- [] x` of the application. Press the button.

>**Note:** When the script is running, if first time install: 
>> 1. The script may exit if you don't have conda installed
>> 2. You may be promted to provide the `Mapbox Default public token`, paste and press enter.
>> 3. You maybe promted with one `y/n` in the terminal. Type `y` and press enter.

You are now done with the automatic startup, and will see more terminals appear, those are the local servers, in time the browser will open two tabs: **The page** & **Backend API documentation**


### Manual project setup in commandline
1. **Create a Conda Environment:**
   Need to be in the directory you want to set the project up in!

   ```bash
    conda create --name YOUR_ENV_NAME

    conda activate YOUR_ENV_NAME

    conda install yarn

    conda install pip
   ```

2. **Set up OpenAI API-key**
   On Windows, search "Environment Variables". In the found window, go to "Environment Variables". Under "User variables for User", click New.
   Fill out the following information:
   ```bash
   Variable name: OPENAI_API_KEY
   Variable  value: *your OPENAI API key*
   ```
   Create an identical under "System variables".

   If you later get an error that the API key is not found, restart your shell.

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

>  **Note:** Open a new termial to progress, remember to acticate the conda conda environment in this terminal as well

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


