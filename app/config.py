import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Production configuration handling."""
    LANGGRAPH_URL = os.getenv("LANGGRAPH_URL", "http://localhost:2024")
    TIMEOUT = float(os.getenv("API_TIMEOUT", "60.0"))
    ENVIRONMENT = os.getenv("ENV", "development")
    
    # Supabase (if needed directly in Python later)
    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

settings = Config()