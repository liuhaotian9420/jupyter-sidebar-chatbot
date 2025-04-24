#!/usr/bin/env python
"""
Run script for the backend API.
This script makes it easier to run the backend from the command line.
"""
import uvicorn

if __name__ == "__main__":
    # Run the API with uvicorn
    uvicorn.run("backend.src.main:app", host="127.0.0.1", port=8000, reload=True) 