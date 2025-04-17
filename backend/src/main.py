from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import random
import time

app = FastAPI(title="Mock LLM API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: dict = None

# Predefined responses for our mock LLM
MOCK_RESPONSES = [
    "I'm a mock LLM response. I can simulate streaming text just like a real language model would.",
    "This is an example of streaming text from a FastAPI backend to your Jupyter extension.",
    "You can enhance this with more features like context awareness, memory, and other LLM capabilities.",
    "The streaming approach allows for a more interactive user experience, similar to ChatGPT or other AI assistants.",
    "In a production environment, you would replace this with calls to a real LLM API or local model."
]

async def stream_response(message: str):
    """Stream a response character by character with random delays"""
    response = random.choice(MOCK_RESPONSES)
    
    # Start with a brief delay
    await asyncio.sleep(0.5)
    
    # Stream each character with a small random delay
    for char in response:
        yield char
        await asyncio.sleep(random.uniform(0.01, 0.1))

@app.post("/chat")
async def chat(request: ChatRequest):
    """Endpoint for chat with streaming response"""
    return StreamingResponse(
        stream_response(request.message),
        media_type="text/plain"
    )

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True) 