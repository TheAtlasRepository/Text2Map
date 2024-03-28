# Use Python 3.9.13 slim as the base image
FROM python:3.9.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the project files to the working directory
COPY .. .

# Install dependencies, Spacy model, and poppler-utils
RUN apt-get update \
    && apt-get install -y poppler-utils \
    && pip install --upgrade pip \
    && pip install -r requirements.txt \
    && python -m spacy download en_core_web_trf \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Expose port 8000
EXPOSE 8000

# Command to run the application with uvicorn in production mode
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
