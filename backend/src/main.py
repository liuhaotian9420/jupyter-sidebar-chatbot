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
    """Mocking a Markdown response: 

# Example Heading
- List item

```
code block
```""",

    """Mocking code-heavy response: 

```python
print("Hello, world!")
```

```javascript
console.log("Hello, world!");
```

```bash
ls -l
```""",

    # ... other responses formatted similarly
]

async def stream_response(message: str):
    """Stream a response character by character with random delays"""
    response = random.choice(MOCK_RESPONSES)
    
    # Start with a brief delay
    await asyncio.sleep(0.5)
    
    # Stream each character with a small random delay
    for char in response:
        yield char
        await asyncio.sleep(random.uniform(0.001, 0.04))

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