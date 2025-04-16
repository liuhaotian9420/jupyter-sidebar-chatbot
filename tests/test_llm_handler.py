"""
Tests for the llm_handler module.
"""

import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import asyncio

# Add the src directory to the path so we can import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/src')))

from llm_handler import LLMHandler

class TestLLMHandler(unittest.TestCase):
    """Test cases for the LLMHandler class."""
    
    def setUp(self):
        """Set up the test cases."""
        self.handler = LLMHandler(provider="mock")
    
    def test_initialization(self):
        """Test that the LLM handler is initialized correctly."""
        self.assertEqual(self.handler.provider, "mock")
    
    def test_mock_llm_response_explain(self):
        """Test the mock LLM response for 'explain' instructions."""
        code = "import numpy as np\nx = np.array([1, 2, 3])\nprint(x.mean())"
        instruction = "Please explain this code to me"
        
        response = self.handler._mock_llm_response(code, instruction)
        
        self.assertIn("explanation", response)
        self.assertIn("NumPy", response["explanation"])
        self.assertIn("suggestions", response)
    
    def test_mock_llm_response_debug_error(self):
        """Test the mock LLM response for 'debug' instructions with an error."""
        code = "print(undefined_var)"
        instruction = "Debug this code for me"
        execution_result = {"status": "error", "stderr": "NameError: name 'undefined_var' is not defined"}
        
        response = self.handler._mock_llm_response(code, instruction, execution_result)
        
        self.assertIn("analysis", response)
        self.assertIn("error", response["analysis"].lower())
        self.assertIn("suggestions", response)
    
    def test_mock_llm_response_debug_success(self):
        """Test the mock LLM response for 'debug' instructions with success."""
        code = "print('Hello, world!')"
        instruction = "Debug this code for me"
        execution_result = {"status": "success", "stdout": "Hello, world!"}
        
        response = self.handler._mock_llm_response(code, instruction, execution_result)
        
        self.assertIn("analysis", response)
        self.assertIn("fine", response["analysis"].lower())
        self.assertIn("suggestions", response)
    
    def test_mock_llm_response_optimize(self):
        """Test the mock LLM response for 'optimize' instructions."""
        code = "for i in range(1000): print(i)"
        instruction = "Optimize this code for me"
        
        response = self.handler._mock_llm_response(code, instruction)
        
        self.assertIn("analysis", response)
        self.assertIn("optimization", response["analysis"].lower())
        self.assertIn("suggestions", response)
    
    def test_mock_llm_response_default(self):
        """Test the mock LLM response for default case."""
        code = "print('Hello, world!')"
        instruction = "Just a random instruction"
        
        response = self.handler._mock_llm_response(code, instruction)
        
        self.assertIn("analysis", response)
        self.assertIn("suggestions", response)
    
    @patch('llm_handler.LLMHandler._call_openai')
    def test_process_query_openai(self, mock_call_openai):
        """Test processing a query with OpenAI provider."""
        # Create a handler with OpenAI provider
        handler = LLMHandler(provider="openai")
        
        # Setup mock
        expected_response = {"analysis": "Test analysis", "suggestions": ["Test suggestion"]}
        mock_call_openai.return_value = expected_response
        
        # Process query
        code = "print('Hello, world!')"
        instruction = "Explain this code to me"
        
        # Use asyncio to run the async method
        result = asyncio.run(handler.process_query(code, instruction))
        
        # Assert the response
        self.assertEqual(result, expected_response)
        mock_call_openai.assert_called_once_with(code, instruction, None)
    
    @patch('llm_handler.LLMHandler._call_ollama')
    def test_process_query_ollama(self, mock_call_ollama):
        """Test processing a query with Ollama provider."""
        # Create a handler with Ollama provider
        handler = LLMHandler(provider="ollama")
        
        # Setup mock
        expected_response = {"analysis": "Test analysis", "suggestions": ["Test suggestion"]}
        mock_call_ollama.return_value = expected_response
        
        # Process query
        code = "print('Hello, world!')"
        instruction = "Explain this code to me"
        
        # Use asyncio to run the async method
        result = asyncio.run(handler.process_query(code, instruction))
        
        # Assert the response
        self.assertEqual(result, expected_response)
        mock_call_ollama.assert_called_once_with(code, instruction, None)

if __name__ == '__main__':
    unittest.main() 