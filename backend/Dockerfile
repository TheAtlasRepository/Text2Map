# Use a Python base image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install the Spacy model
RUN python -m spacy download en_core_web_trf

# Copy the rest of your application's code
COPY . .

# Command to run your app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
