

## Setting up Miniconda Environment

1. **Install Miniconda:**
   - Download and install Miniconda from [Miniconda website](https://docs.conda.io/en/latest/miniconda.html).

2. **Create a Conda Environment:**
   - Need to be in the directory you want to set the project up in!

   ```bash
    conda create --name YOUR_ENV_NAME

    conda activate YOUR_ENV_NAME

    conda install yarn

    conda install pip

    pip install --upgrade openai

    pip install Geocoder

    pip install mapbox

    pip install fastapi

    pip install "uvicorn[standard]"



3. **To Run Frontend**
   ```bash
   cd frontend

   yarn add next

   yarn add mapbox-gl

   npx v0@latest init 

   npm install socket.io-client

   npm install react-map-gl

   npm install @radix-ui/react-slot

   yarn dev

5. **To run Backend**
   ```bash
   cd backend

   pip install spacy

   python -m spacy download en_core_web_lg 560MB // python -m spacy download en_core_web_sm 12MB

   uvicorn main:app --reload
