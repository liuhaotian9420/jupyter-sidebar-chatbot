# Mock LLM Service Backend

This is a simple FastAPI backend that mocks an LLM service with streaming responses.

## Features

- Mock LLM service with predefined responses
- Character-by-character streaming responses
- Simple API with health check endpoint

## Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

1. Start the server:

```bash
cd backend
python src/main.py
```

The server will start on http://localhost:8000

## API Endpoints

### POST /chat

Simulate a chat with a streaming response.

**Request:**
```json
{
  "message": "Your message here",
  "context": { "optional": "context" }
}
```

**Response:**
Streaming text response

### GET /health

Simple health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1621234567.89
}
```

## Development

To modify the mock responses, edit the `MOCK_RESPONSES` list in `src/main.py`.

To adjust the streaming behavior, modify the `stream_response` function in `src/main.py`. 