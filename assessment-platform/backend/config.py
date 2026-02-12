import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB = os.getenv("MONGO_DB", "questionbank")
    QUESTIONS_PER_REQUEST = int(os.getenv("QUESTIONS_PER_REQUEST", "25"))
    QUERY_TIMEOUT_MS = int(os.getenv("QUERY_TIMEOUT_MS", "5000"))
    SELECTION_STRATEGY = os.getenv("SELECTION_STRATEGY", "sample")
    DIFFICULTY_SCALE = os.getenv("DIFFICULTY_SCALE", "zeroBased")
    PORT = int(os.getenv("PORT", "8000"))
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not MONGO_URI:
        raise ValueError("MONGO_URI environment variable is required")

config = Config()
