# Documentation for `backend/src/main.py`

This script sets up and runs a mock FastAPI backend server designed to simulate responses from an LLM (Large Language Model) for the Jupyter LLM Extension frontend. It provides basic endpoints for health checks and chat interactions.

## Overview

The backend serves the following purposes:
-   **Mock LLM Responses:** Provides a `/chat` endpoint that streams simulated responses, including plain text, Markdown code blocks, and image URLs.
-   **Static File Serving:** Serves images from the `src` directory under the `/images` path.
-   **State Simulation:** Includes basic logic to update a global state (`LATEST_ACTION`) based on "confirmed" or "rejected" messages received via the `/chat` endpoint. This simulates user interaction with potential interrupt messages.
-   **Image Handling:** Includes a utility function (`ensure_image_size_constraint`) to resize images if they exceed specified dimensions before serving their URL.
-   **Health Check:** Offers a `/health` endpoint to verify the server is running.

## Key Components

### FastAPI App Initialization

```python
app = FastAPI(
    title="Mock LLM API",
    description="A mock API for testing LLM integrations",
    version="1.0.0"
)

# Mount static directory
app.mount("/images", StaticFiles(directory="src"), name="images")

# Enable CORS
app.add_middleware(...)
```

-   Initializes the FastAPI application with metadata.
-   Mounts the `src` directory to serve static files (specifically images) under `/images`.
-   Configures Cross-Origin Resource Sharing (CORS) to allow requests from any origin (suitable for development).

### Global State

```python
LATEST_ACTION: str = "idle"
```

-   A simple global variable to track the last simulated user action (e.g., "confirmed", "rejected").

### Data Models

```python
class ChatRequest(BaseModel):
    message: str
    context: dict = None
```

-   Defines the expected structure for incoming requests to the `/chat` endpoint using Pydantic.

### Utility Functions

#### `ensure_image_size_constraint(image_path, max_size=(512, 512))`

-   **Purpose:** Checks if an image file at `image_path` exceeds the `max_size` dimensions. If it does, it resizes the image while maintaining aspect ratio, saves it with a `_resized` suffix, and returns the path to the resized image. Otherwise, it returns the original path.
-   **Arguments:**
    -   `image_path` (str): Path to the input image file.
    -   `max_size` (tuple): A tuple `(width, height)` specifying the maximum allowed dimensions.
-   **Returns:** (str) Path to the original or resized image file.

#### `get_base64_image()` (Currently Unused)

-   **Purpose:** Reads the `normal_distribution.png` image file and returns its base64 encoded string. *Note: This function is defined but not currently called in the main execution flow.*

### Mock Responses & Image Setup

```python
image_path = 'src/normal_distribution.png'
constrained_image_path = ensure_image_size_constraint(image_path)
image_url = "/images/" + os.path.basename(constrained_image_path)

MOCK_RESPONSES = [...]
```

-   Defines the path to the source image (`normal_distribution.png`).
-   Calls `ensure_image_size_constraint` to get the path to the potentially resized image.
-   Constructs the URL (`image_url`) that will be used to serve the image via the `/images` static path.
-   `MOCK_RESPONSES`: A list containing sample response strings, including text and a Python code block example.

### Streaming Functions

#### `stream_response(message: str)`

-   **Purpose:** Asynchronously generates a stream of characters for a mock text/code response.
-   **Logic:**
    -   Randomly selects a response string from `MOCK_RESPONSES`.
    -   Yields each character of the chosen response with small, random delays to simulate streaming.
-   **Returns:** An async generator yielding characters (str).

#### `stream_image_url()`

-   **Purpose:** Asynchronously generates a stream of characters for the pre-defined `image_url`.
-   **Logic:**
    -   Yields each character of the `image_url` string with small, random delays.
-   **Returns:** An async generator yielding characters (str).

### API Endpoints

#### `POST /chat`

```python
@app.post("/chat")
async def chat(request: ChatRequest) -> Response:
```

-   **Purpose:** Handles incoming chat messages.
-   **Logic:**
    -   Receives a `ChatRequest` containing the user's message.
    -   Checks if the message is "confirmed" or "rejected" (case-insensitive).
        -   If yes, updates the global `LATEST_ACTION` state and streams back the `image_url` using `stream_image_url()`.
        -   If no (regular message), streams back a random mock response using `stream_response()`.
-   **Returns:** A `StreamingResponse` containing the character stream.

#### `GET /health`

```python
@app.get("/health")
async def health_check():
```

-   **Purpose:** Provides a simple health check endpoint.
-   **Returns:** A JSON response indicating the server status ("ok") and the current timestamp.

### Server Execution

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

-   Runs the FastAPI application using the `uvicorn` ASGI server when the script is executed directly.
-   Listens on `127.0.0.1:8000`.
-   Enables auto-reloading for development convenience. 