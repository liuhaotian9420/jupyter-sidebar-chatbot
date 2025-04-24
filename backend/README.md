# JupyterLab LLM Extension Backend

This is the backend server for the JupyterLab LLM Extension. It provides a RESTful API for integrating with various LLM providers through a LangGraph-based chatbot.

## Features

- LangGraph-based conversational agent
- Support for multiple LLM providers (OpenAI, Local via Ollama, etc.)
- Configurable through frontend settings panel
- Fallback to mock responses when LLM services are unavailable
- Image generation and serving capabilities

## Setup and Installation

1. Create a Python virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install required packages:

```bash
pip install -r requirements.txt
```

3. (Optional) Set up environment variables:

You can create a `.env` file in the `backend` directory with the following variables:

```
OPENAI_API_KEY=your_api_key_here
OPENAI_API_BASE=https://custom-endpoint-if-needed.com/v1
```

## Running the Server

To start the backend server:

```bash
cd backend
python src/main.py
```

The server will be available at http://localhost:8000.

## API Endpoints

### POST /chat

Sends a message to the chatbot and receives a streaming response.

**Request Body:**
```json
{
  "message": "Your message here",
  "context": {
    "history": [] // Optional array of previous messages
  }
}
```

**Response:**
Streams the response as plain text.

### POST /settings

Updates the LLM configuration settings.

**Request Body:**
```json
{
  "provider": "OpenAI",
  "apiKey": "your-api-key",
  "apiUrl": "https://optional-custom-endpoint.com",
  "rules": "Optional custom rules or instructions"
}
```

**Response:**
```json
{
  "status": "ok",
  "settings": {
    "provider": "OpenAI",
    "api_key": "your-api-key",
    "api_url": "https://optional-custom-endpoint.com",
    "rules": "Optional custom rules or instructions"
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1234567890.123
}
```

## LangGraph Chatbot

The LangGraph chatbot is implemented in `src/llm_graph.py`. It provides a simple conversational agent that:

1. Processes input messages
2. Generates responses via the configured LLM
3. Supports streaming responses

The graph can be extended with additional nodes for:
- RAG capabilities (retrieval augmented generation)
- Tool use
- Multi-step reasoning
- Context management

## Development

To extend the backend:

1. Add new nodes to the LangGraph in `src/llm_graph.py`
2. Add new endpoints in `src/main.py`
3. Add new settings in `src/settings.py` 