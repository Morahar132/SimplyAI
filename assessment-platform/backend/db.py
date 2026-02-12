from pymongo import MongoClient
from config import config

_client = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(config.MONGO_URI, maxPoolSize=20, minPoolSize=2)
    return _client[config.MONGO_DB]

def close_db():
    global _client
    if _client:
        _client.close()
        _client = None
