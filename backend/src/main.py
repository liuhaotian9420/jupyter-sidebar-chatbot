from fastapi import FastAPI, Request, Response
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

app = FastAPI(
    title="Mock LLM API",
    description="A mock API for testing LLM integrations",
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

# Global state variable to store the latest action
LATEST_ACTION: str = "idle"

class ChatRequest(BaseModel):
    message: str
    context: dict = None

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
    image_url,
    INTERRUPT_MESSAGE,
    # A standard text response
    "This is a standard mock response.",
    # Code blocks with different languages
    """Let me show you some code examples:
    ```python
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    ```
    """,

]

async def stream_response(message: str):
    """Stream a standard mock response character by character with random delays"""
    # Always choose from the standard MOCK_RESPONSES
    response = random.choice(MOCK_RESPONSES)
    
    # Start with a brief delay
    await asyncio.sleep(0.2)

    # Stream each character of the actual response content with a small random delay
    for char in response:
        yield char
        await asyncio.sleep(random.uniform(0.001, 0.004))

@app.post("/chat")
async def chat(request: ChatRequest) -> Response:
    """Endpoint for chat messages. Updates state if action received, always streams a mock response."""
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
        # For regular messages, return a standard streaming response
        return StreamingResponse(
            stream_response(request.message),
            media_type="text/plain"
        )

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
    return {"status": "ok", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True) 