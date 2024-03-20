#!/bin/bash

# Function to prompt user for OPENAI_API_KEY
prompt_api_key() {
    echo "Please enter your OpenAI API key:"
    read -r api_key
    echo "export OPENAI_API_KEY='$api_key'" >> "$HOME/.bash_profile"
    echo "API key set successfully. Please restart your terminal or run 'source ~/.bash_profile'."
}

# Check if OPENAI_API_KEY environment variable is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "OPENAI_API_KEY is not set."
    prompt_api_key
else
    echo "OPENAI_API_KEY is set: $OPENAI_API_KEY"
fi

# Place the rest of your script here
# Sends contents from logo.txt to the console
cat boot_utilities/logo.txt
echo

condapath="$HOME/miniconda3/bin/activate"
envname="Text2Map"
repopath="$(pwd)"
spacy_model="en_core_web_trf"

# Check if conda is system installation or user installation
if [ -f "$condapath" ]; then
    echo "Conda found in user directory"
elif [ -d "/usr/local/miniconda3" ]; then
    condapath="/usr/local/miniconda3/bin/activate"
    echo "Conda found in system directory"
else
    echo "Conda not found"
    exit 1
fi

# Check if front and backend folders exist
if [ ! -d "$repopath/frontend" ]; then
    echo "Frontend folder not found"
    exit 1
fi
if [ ! -d "$repopath/backend" ]; then
    echo "Backend folder not found"
    exit 1
fi

# Check if .env.local file exists
if [ ! -f "$repopath/frontend/.env.local" ]; then
    bash boot_utilities/create_env.sh
fi

# Try to start conda base environment
source "$condapath" base
if [ $? -eq 0 ]; then
    echo "Conda base environment is now active."
else
    echo "Conda base environment could not be activated/start or does not exist."
    exit 1
fi

# Check if Conda environment exists
if conda info --envs | grep -q "\<$envname\>"; then
    # Environment exists, activate it
    echo "Activating existing Conda environment: $envname"
    source "$condapath" $envname
else
    # Environment doesn't exist, create and activate it
    echo "Creating and activating new Conda environment: $envname"
    conda create --name $envname python=3.8 -y
    source "$condapath" $envname
    conda install -q --yes yarn
    conda install -q --yes pip
fi
echo "Conda environment $envname is now active."

# Check if spaCy model is installed, if not, download it
if ! python -c "import spacy; nlp = spacy.load('$spacy_model')"; then
    echo "Downloading spaCy model: $spacy_model"
    python -m spacy download $spacy_model
fi

# Start the frontend and backend in separate Terminal windows
osascript -e 'tell application "Terminal" to do script "source '$condapath' '$envname' && cd '$repopath/frontend' && yarn install -s && yarn dev"'
osascript -e 'tell application "Terminal" to do script "source '$condapath' '$envname' && cd '$repopath/backend' && pip install --quiet -r requirements.txt && uvicorn main:app --reload"'

# Check if server is running every second. If not successful after 20 seconds, exit. If successful, open browser
count=0
while [ $count -lt 20 ]; do
    sleep 1
    count=$((count+1))
    curl -s http://localhost:3000 >/dev/null
    if [ $? -eq 0 ]; then
        open "http://localhost:8000/docs"
        open "http://localhost:3000"
        exit 0
    fi
done
echo "Server could not be started"
exit 1
