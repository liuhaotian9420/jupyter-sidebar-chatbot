from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import asyncio
import base64
import random
import time
from PIL import Image  # For image processing
import io
import os
from typing import Optional, List, Dict, Any, Union
import sys
import uuid

# Add parent directory to path to make imports work in different contexts
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import our new modules
try:
    from backend.src.settings import LLMSettings, update_settings, get_settings
    from backend.src.llm_graph import LLMGraphChat
    LANGGRAPH_AVAILABLE = True
except ImportError:
    try:
        from src.settings import LLMSettings, update_settings, get_settings
        from src.llm_graph import LLMGraphChat
        LANGGRAPH_AVAILABLE = True
    except ImportError:
        print("LangGraph not available, falling back to mock responses")
        LANGGRAPH_AVAILABLE = False

app = FastAPI(
    title="LLM API",
    description="API for LLM integrations with JupyterLab",
    version="1.0.0"
)

# Mount static directory to serve images
app.mount("/images", StaticFiles(directory="src"), name="images")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state variables
LATEST_ACTION: str = "idle"
llm_chat = None  # Will be initialized on first use or settings update

class ChatRequest(BaseModel):
    message: str
    context: dict = None
    thread_id: Optional[str] = None

class SettingsRequest(BaseModel):
    provider: str
    apiKey: str
    apiUrl: Optional[str] = None
    rules: Optional[str] = None
    model: Optional[str] = "gpt-4"

def ensure_image_size_constraint(image_path, max_size=(512, 512)):
    """
    Check if image exceeds max_size and resize if necessary.
    Returns the path to the constrained image.
    """
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            
            # If image is within constraints, return original path
            if width <= max_size[0] and height <= max_size[1]:
                return image_path
            
            # Calculate new dimensions maintaining aspect ratio
            if width > height:
                new_width = max_size[0]
                new_height = int(height * (max_size[0] / width))
            else:
                new_height = max_size[1]
                new_width = int(width * (max_size[1] / height))
            
            # Resize the image
            resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Create filename for resized image
            base_name, ext = os.path.splitext(image_path)
            resized_path = f"{base_name}_resized{ext}"
            
            # Save the resized image
            resized_img.save(resized_path)
            print(f"Image resized from {width}x{height} to {new_width}x{new_height}")
            
            return resized_path
    except Exception as e:
        print(f"Error processing image: {e}")
        return image_path  # Return original path in case of error


def get_base64_image():
    with open('src/normal_distribution.png', 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Ensure image meets size constraints
image_path = 'src/normal_distribution.png'
constrained_image_path = ensure_image_size_constraint(image_path)
# Adjust image URL if it was resized
image_url = "/images/" + os.path.basename(constrained_image_path)


INTERRUPT_MESSAGE = "**[INTERRUPT]** This is an interruption in the conversation flow. The system needs your attention."

# Simplified MOCK_RESPONSES - only contains normal responses now
MOCK_RESPONSES = [
    # Send the URL to the image
    # image_url,
    # INTERRUPT_MESSAGE,
    # A standard text response
    "This is a standard mock response.",
    # # Code blocks with different languages
    """Let me show you some code examples:
    ```python
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    ```
    """,
]

# Function to lazily initialize the LLM client
def get_llm_chat():
    global llm_chat
    if not llm_chat and LANGGRAPH_AVAILABLE:
        try:
            settings = get_settings()
            llm_chat = LLMGraphChat(
                provider=settings.provider,
                api_key=settings.api_key,
                api_url=settings.api_url,
                model=settings.model
            )
            print(f"LLM client initialized with settings: provider={settings.provider}, model={settings.model}")
        except Exception as e:
            print(f"Error initializing LLM client: {e}")
            # Return None to indicate initialization failed
            return None
    return llm_chat

async def stream_response(message: str, context: dict = None, thread_id: Optional[str] = None):
    """Stream a response using either LangGraph or mock responses"""
    # Try to use LangGraph if available
    chat = get_llm_chat()
    
    if chat and LANGGRAPH_AVAILABLE:
        try:
            print(f"Using LangGraph to stream response for message: {message}")
            async for chunk in chat.astream_chat(message, context, thread_id):
                print(f"Streaming chunk: {chunk}")
                yield chunk
            return
        except Exception as e:
            print(f"Error using LangGraph: {e}")
            # Fall back to mock responses if LangGraph fails
    
    # Use mock responses as fallback
    print("Using mock responses as fallback")
    response = random.choice(MOCK_RESPONSES)
    
    # Start with a brief delay
    await asyncio.sleep(0.2)

    # Stream each character of the actual response content with a small random delay
    for char in response:
        yield char
        await asyncio.sleep(random.uniform(0.001, 0.004))

@app.post("/chat")
async def chat(request: ChatRequest) -> Response:
    """Endpoint for chat messages. Updates state if action received, always streams a response."""
    global LATEST_ACTION # Declare intent to modify the global variable

    message_lower = request.message.lower().strip()

    # Update global state if the message is a known action
    if message_lower == 'confirmed':
        LATEST_ACTION = "confirmed"
        print(f"Global state updated: LATEST_ACTION = {LATEST_ACTION}")
    elif message_lower == 'rejected':
        LATEST_ACTION = "rejected"
        print(f"Global state updated: LATEST_ACTION = {LATEST_ACTION}")
    # else: LATEST_ACTION remains unchanged for regular messages

    # For confirmed/rejected messages, ensure we always return the image URL
    if message_lower in ['confirmed', 'rejected']:
        # Always return the image URL for confirmation/rejection messages
        return StreamingResponse(
            stream_image_url(), 
            media_type="text/plain"
        )
    else:
        # For regular messages, return a streaming response with thread_id if provided
        return StreamingResponse(
            stream_response(request.message, request.context, request.thread_id),
            media_type="text/plain"
        )

@app.post("/create-thread")
async def create_thread():
    """Create a new thread for chat conversation"""
    try:
        chat = get_llm_chat()
        if chat and LANGGRAPH_AVAILABLE:
            try:
                thread_id = chat.create_thread()
                print(f"Created thread with ID: {thread_id}")
                return {"thread_id": thread_id}
            except Exception as e:
                print(f"Error in LangGraph create_thread: {e}")
                # Fallback to random UUID
                fallback_id = str(uuid.uuid4())
                print(f"Using fallback thread ID: {fallback_id}")
                return {"thread_id": fallback_id}
        else:
            # Generate a random thread ID if LangGraph is not available
            random_id = str(uuid.uuid4())
            print(f"LangGraph not available, using random thread ID: {random_id}")
            return {"thread_id": random_id}
    except Exception as e:
        error_msg = f"Unexpected error in create_thread: {str(e)}"
        print(error_msg)
        return JSONResponse(
            status_code=500,
            content={"error": error_msg}
        )

@app.get("/threads")
async def list_threads():
    """List all available chat threads"""
    chat = get_llm_chat()
    if chat and LANGGRAPH_AVAILABLE:
        threads = chat.get_threads()
        return {"threads": threads}
    else:
        return {"threads": []}

@app.post("/settings")
async def update_llm_settings(request: SettingsRequest):
    """Update LLM settings"""
    # Update the settings
    settings_dict = {
        "provider": request.provider,
        "api_key": request.apiKey,
        "api_url": request.apiUrl,
        "rules": request.rules,
        "model": request.model
    }
    
    updated_settings = update_settings(settings_dict)
    
    # Recreate the LLM chat instance with new settings
    global llm_chat
    if LANGGRAPH_AVAILABLE:
        llm_chat = LLMGraphChat(
            provider=updated_settings.provider,
            api_key=updated_settings.api_key,
            api_url=updated_settings.api_url,
            model=updated_settings.model
        )
    
    return {"status": "ok", "settings": updated_settings.dict()}

async def stream_image_url():
    """Stream just the image URL with minimal delay"""
    # Brief initial delay
    await asyncio.sleep(0.2)
    
    # Return clean image URL
    image_url_clean = image_url.strip()
    for char in image_url_clean:
        yield char
        await asyncio.sleep(random.uniform(0.001, 0.004))

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    print(f"Health check requested at {time.time()}")
    return {"status": "ok", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    # Run the app directly
    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=True) 