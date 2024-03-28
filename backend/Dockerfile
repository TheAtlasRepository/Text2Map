# Stage 1: Requirements Generation (Optional) 
FROM python:3.9.13 as requirements

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ../pyproject.toml /app/ 
RUN pip install pip-tools
RUN pip-compile --output-file=requirements.txt pyproject.toml

# Stage 2: Build Environment
FROM python:3.9.13 as build

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY --from=requirements /app/requirements.txt /app/requirements.txt

# Create and activate virtual environment
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip 
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY .. /app 

# Install Spacy model
RUN python -m spacy download en_core_web_trf

# Install system dependencies 
RUN apt-get update && apt-get install -y poppler-utils 

# Stage 3: Production Environment
FROM python:3.9.13 as production 

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY --from=build /app /app

# Copy .env file if needed
RUN if [ ! -f /app/.env ] && [ -f .env ]; then cp .env /app/; fi

# Install from built wheels (optional)
# RUN pip install dist/*.whl 

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0" , "--port", "8000"]
