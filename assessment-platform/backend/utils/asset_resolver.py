"""Asset resolution utility"""
import re
from typing import Dict, Any
from bson import ObjectId
from db import get_db

def resolve_asset_urls(text: str) -> str:
    """Replace <tm-asset id="..."/> with actual URLs"""
    if not text or '<tm-asset' not in text:
        return text
    
    db = get_db()
    pattern = r'<tm-asset id="([^"]+)"\s*/>'
    asset_ids = re.findall(pattern, text)
    
    if asset_ids:
        assets = list(db["assets"].find(
            {"_id": {"$in": [ObjectId(aid) for aid in asset_ids]}},
            {"_id": 1, "url": 1}
        ))
        asset_map = {str(a["_id"]): a.get("url", "") for a in assets}
        
        def replace_asset(match):
            asset_id = match.group(1)
            url = asset_map.get(asset_id, "")
            return f'<img src="{url}" alt="Explanation" />' if url else match.group(0)
        
        text = re.sub(pattern, replace_asset, text)
    
    return text

def resolve_assets_in_question(question: Dict[str, Any]) -> Dict[str, Any]:
    """Resolve all asset references in question"""
    if "answer" in question and "explanation" in question["answer"]:
        if "text" in question["answer"]["explanation"]:
            question["answer"]["explanation"]["text"] = resolve_asset_urls(
                question["answer"]["explanation"]["text"]
            )
    
    if "question" in question and "body" in question["question"]:
        if "text" in question["question"]["body"]:
            question["question"]["body"]["text"] = resolve_asset_urls(
                question["question"]["body"]["text"]
            )
    
    return question
