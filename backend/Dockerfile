# Use Python 3.9.13 as the base image
FROM python:3.9.13 

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the project files to the working directory
COPY .. .

# Install the dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Install the Spacy model
RUN python -m spacy download en_core_web_trf

#install poppler-utils
RUN apt-get update && apt-get install -y poppler-utils

# Expose port 8000
EXPOSE 8000

# Command to run the application with uvicorn in production mode
CMD ["uvicorn", "main:app", "--host", "0.0.0.0" , "--port", "8000"]
