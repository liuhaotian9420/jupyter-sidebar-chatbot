"""
Tests for the app module.
"""

import sys
import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Add the src directory to the path so we can import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/src')))
import app  # Import after path modification, but with all other imports

class TestApp(unittest.TestCase):
    """Test cases for the FastAPI app."""
    
    def setUp(self):
        """Set up the test client."""
        self.client = TestClient(app.app)
    
    def test_root(self):
        """Test the root endpoint."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "alive", "service": "jupyter-llm-ext"})
    
    @patch('app.KernelManager')
    def test_execute_code(self, mock_kernel_manager):
        """Test the execute_code endpoint."""
        # Setup mock
        code = 'print("Hello, world!")'
        
        # Make the request
        response = self.client.post(
            "/execute",
            json={"code": code}
        )
        
        # Assert the response
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["status"], "success")
        self.assertIn("Executed:", result["stdout"])
        self.assertIn("sample", result["result"])

if __name__ == '__main__':
    unittest.main() 