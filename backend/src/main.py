from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import asyncio
import base64
import random
import time
from PIL import Image  # For image processing
import io
import os
from typing import Optional

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


# Predefined responses for our mock LLM
MOCK_RESPONSES = [
    # Send the URL to the image
    image_url,
    # Define an interruption message
    INTERRUPT_MESSAGE
]

MOCK_REJECTION_RESPONSES = [
    "You've rejected the task.",
    "A rejection has been received.",
]

MOCK_CONFIRMATION_RESPONSES = [
    "You've confirmed that you want to proceed with the task.",
    "A confirmation has been received.",
]

async def stream_response(message: str):
    """Stream a response character by character with random delays"""
    # Handle confirmation/rejection messages
    if message.lower() == 'confirmed':
        # Send a confirmation response first
        confirmation_response = random.choice(MOCK_CONFIRMATION_RESPONSES)
        # Start with a brief delay
        await asyncio.sleep(0.5)
        
        # Stream confirmation response
        for char in confirmation_response:
            yield char
            await asyncio.sleep(random.uniform(0.001, 0.004))
            
        # Add a separator before the regular response
        yield "\n\n"
        await asyncio.sleep(0.5)
        
        # Then continue with a regular response
        response = random.choice(MOCK_RESPONSES)
        for char in response:
            yield char
            await asyncio.sleep(random.uniform(0.001, 0.004))
        return
        
    elif message.lower() == 'rejected':
        # Send a rejection response first
        rejection_response = random.choice(MOCK_REJECTION_RESPONSES)
        # Start with a brief delay
        await asyncio.sleep(0.5)
        
        # Stream rejection response
        for char in rejection_response:
            yield char
            await asyncio.sleep(random.uniform(0.001, 0.004))
            
        # Add a separator before the regular response
        yield "\n\n"
        await asyncio.sleep(0.5)
        
        # Then continue with a regular response
        response = random.choice(MOCK_RESPONSES)
        for char in response:
            yield char
            await asyncio.sleep(random.uniform(0.001, 0.004))
        return
    
    # Regular message handling (not confirmation/rejection)
    response = random.choice(MOCK_RESPONSES)
    
    # Start with a brief delay
    await asyncio.sleep(0.5)
    
    # Randomly decide whether to send an interrupt (20% chance)
    should_interrupt = random.random() < 0.2
    
    if should_interrupt:
        # Stream the interrupt message first
        for char in INTERRUPT_MESSAGE:
            yield char
            await asyncio.sleep(random.uniform(0.001, 0.004))
        
        # Add a blank line after interrupt
        yield "\n\n"
        await asyncio.sleep(0.5)
        return
    
    # Stream each character of the actual response with a small random delay
    for char in response:
        yield char
        await asyncio.sleep(random.uniform(0.001, 0.004))

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