#!/usr/bin/env python
"""
Run script for the backend API.
This script makes it easier to run the backend from the command line.
"""
import uvicorn
import os
import sys

# Add the current directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Run the API with uvicorn
    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=True) 