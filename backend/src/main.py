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
    # Basic markdown with headers and lists
    """# Main Header
## Subheader
Here's a simple list:
- First item
- Second item with **bold** text
- Third item with *italic* text""",

    # Code blocks with different languages
    """Let me show you some code examples:

```python
def hello_world():
    print("Hello, World!")
    return True

# This is a comment
result = hello_world()
```

And here's a JavaScript example:
```javascript
function calculateSum(a, b) {
    const sum = a + b;
    if (sum > 100) {
        return "That's a big number!";
    }
    return sum;
}
```""",

    # Mixed markdown with inline code and TypeScript
    """Here's how to define a TypeScript interface with `inline code`:

```typescript
interface User {
    name: string;
    age: number;
    roles: string[];
}

const user: User = {
    name: "John Doe",
    age: 30,
    roles: ["admin", "user"]
};
```

You can access properties like `user.name`.""",

    # SQL with special characters
    """Let's write a SQL query:

```sql
SELECT u.name, u.email
FROM users u
WHERE u.status = 'active'
  AND u.last_login > '2024-01-01'
  -- This is a comment with special chars: #, `, *
ORDER BY u.name DESC;
```

Remember to properly escape your strings!""",

    # Complex nested example
    """# API Documentation

## Authentication
First, you need to authenticate:

```python
import requests

def get_token(username: str, password: str) -> str:
    response = requests.post(
        "https://api.example.com/auth",
        json={"username": username, "password": password}
    )
    return response.json()["token"]
```

## Making Requests
Then you can make requests:

```javascript
// Using the token in JavaScript
async function fetchData(token) {
    const response = await fetch('https://api.example.com/data', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}
```

### Error Handling
Handle errors appropriately:
- Check status codes
- Validate response format
- Implement retry logic

```typescript
interface APIError {
    code: number;
    message: string;
}

function handleError(error: APIError) {
    console.error(`Error ${error.code}: ${error.message}`);
}
```"""
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