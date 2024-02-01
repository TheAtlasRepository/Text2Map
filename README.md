# Text/CSV 2 Map
## Setting up project

1. **Install Miniconda:**
   Download and install Miniconda from [Miniconda website](https://docs.conda.io/en/latest/miniconda.html).

2. **Create a Conda Environment:**
   Need to be in the directory you want to set the project up in!

   ```bash
    conda create --name YOUR_ENV_NAME

    conda activate YOUR_ENV_NAME

    conda install yarn

    conda install pip
   ```

3. **Set up OpenAI API-key**
   On Windows, search "Environment Variables". In the found window, go to "Environment Variables". Under "User variables for User", click New.
   Fill out the following information:
   ```bash
   Variable name: OPENAI_API_KEY
   Variable  value: *your OPENAI API key*
   ```
   Create an identical under "System variables".

   If you later get an error that the API key is not found, restart your shell.

4. **To run Backend**
   ```bash
   cd backend

   pip install -r requirements.txt

   Install Spacy, large (560MB) OR small (12MB), large is recommended
   python -m spacy download en_core_web_lg
   OR
   python -m spacy download en_core_web_sm

   uvicorn main:app --reload
   ```

5. **Set up Mapbox API key**
   In directory "frontend", create a file named `.env.local`.
   Add and modify the following line:
   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=*your Mapbox API key*
   ```

6. **To Run Frontend**
   ```bash
   cd frontend

   yarn install

   yarn dev
   ```


