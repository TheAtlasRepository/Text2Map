# Base Image
FROM python:3.9.13 

# Environment Variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Working Directory
WORKDIR /app

# Copy Project Files
COPY .. /app

# Create and activate virtual environment
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install Dependencies
RUN pip install --no-cache-dir --upgrade pip 
RUN pip install --no-cache-dir -r requirements.txt

# Install Spacy Model
RUN python -m spacy download en_core_web_trf

# Install System Dependencies
RUN apt-get update && apt-get install -y poppler-utils 

# Expose Port 
EXPOSE 8000

# Application Startup Command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0" , "--port", "8000"]
