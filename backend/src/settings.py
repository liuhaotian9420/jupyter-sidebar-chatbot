from pydantic import BaseModel, Field
from typing import Optional

class LLMSettings(BaseModel):
    """Settings for LLM configuration"""
    provider: str = Field(default="OpenAI", description="LLM provider (OpenAI, HuggingFace, Local)")
    api_key: str = Field(default="", description="API key for the LLM provider")
    api_url: Optional[str] = Field(default=None, description="Custom API URL if any")
    rules: Optional[str] = Field(default=None, description="Custom rules or instructions for the LLM")
    model: str = Field(default="gpt-4", description="Model name to use for LLM interactions")

# Global settings instance with defaults
global_settings = LLMSettings()

def update_settings(settings_dict: dict) -> LLMSettings:
    """
    Update the global settings with new values
    
    Args:
        settings_dict: Dictionary containing settings values
        
    Returns:
        The updated settings object
    """
    global global_settings
    global_settings = LLMSettings(**settings_dict)
    return global_settings

def get_settings() -> LLMSettings:
    """
    Get the current settings
    
    Returns:
        The current settings object
    """
    return global_settings 