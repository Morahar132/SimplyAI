from bson import ObjectId
from typing import List, Dict, Any
from db import get_db
from config import config
from enums import QuestionType, Difficulty
from utils.asset_resolver import resolve_assets_in_question

def convert_objectids(obj):
    """Recursively convert ObjectId to string and remove html fields"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        # Remove 'html' key if present
        return {k: convert_objectids(v) for k, v in obj.items() if k != 'html'}
    elif isinstance(obj, list):
        return [convert_objectids(item) for item in obj]
    return obj

def build_match_filter(filters: Dict[str, Any]) -> Dict[str, Any]:
    """Build MongoDB match filter based on drona.md logic"""
    match = {
        "isPublic": True,
        "type": filters["type"],
        "meta.difficulty": filters["difficulty"]
    }
    
    # Build tag matching with $elemMatch
    tag_match = {
        "course_id": ObjectId(filters["courseId"])
    }
    
    if filters.get("subjectId"):
        tag_match["subject_id"] = ObjectId(filters["subjectId"])
    
    topic_ids = [ObjectId(tid) for tid in filters.get("topicIds", []) if tid]
    subtopic_ids = [ObjectId(sid) for sid in filters.get("subtopicIds", []) if sid]
    
    if topic_ids and subtopic_ids:
        tag_match["$or"] = [
            {"topic_id": {"$in": topic_ids}},
            {"subtopic_id": {"$in": subtopic_ids}}
        ]
    elif topic_ids:
        tag_match["topic_id"] = {"$in": topic_ids}
    elif subtopic_ids:
        tag_match["subtopic_id"] = {"$in": subtopic_ids}
    
    match["tags"] = {"$elemMatch": tag_match}
    return match

def fetch_questions(filters: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
    """Fetch questions from MongoDB with filters"""
    db = get_db()
    collection = db["questions"]
    
    match = build_match_filter(filters)
    
    # Projection: Return required fields WITHOUT html
    projection = {
        "_id": 1,
        "type": 1,
        "question.body.text": 1,
        "question.body.latexes.latex": 1,
        "question.body.latexes._id": 1,
        "question.options.d.text": 1,
        "question.options.d.latexes.latex": 1,
        "question.options.d.latexes._id": 1,
        "question.options.v": 1,
        "answer.answer": 1,
        "answer.explanation.text": 1,
        "answer.explanation.latexes.latex": 1,
        "answer.explanation.latexes._id": 1,
        "meta.difficulty": 1,
        "tags": 1  # Include tags for topic name resolution
    }
    
    # Fetch more to account for potential duplicates
    fetch_limit = limit * 3
    
    if config.SELECTION_STRATEGY == "newest":
        pipeline = [
            {"$match": match},
            {"$sort": {"createdAt": -1, "_id": -1}},
            {"$limit": fetch_limit},
            {"$project": projection}
        ]
    else:
        pipeline = [
            {"$match": match},
            {"$sample": {"size": fetch_limit}},
            {"$project": projection}
        ]
    
    questions = list(collection.aggregate(
        pipeline,
        allowDiskUse=True,
        maxTimeMS=config.QUERY_TIMEOUT_MS
    ))
    
    # Deduplicate by question text
    seen = set()
    unique_questions = []
    for q in questions:
        text = q.get("question", {}).get("body", {}).get("text", "")
        if text and text not in seen:
            seen.add(text)
            unique_questions.append(q)
            if len(unique_questions) >= limit:
                break
    
    # Convert all ObjectIds to strings recursively
    unique_questions = [convert_objectids(q) for q in unique_questions]
    
    # Resolve asset URLs in explanations
    unique_questions = [resolve_assets_in_question(q) for q in unique_questions]
    
    # Add topic names for AI review
    for question in unique_questions:
        if 'tags' in question and question['tags']:
            tag = question['tags'][0]
            # Fetch topic name
            if 'topic_id' in tag:
                topic = db['topics'].find_one({'_id': ObjectId(tag['topic_id'])}, {'name': 1})
                question['topicName'] = topic['name'] if topic else 'General'
            # Fetch subtopic name
            if 'subtopic_id' in tag:
                subtopic = db['topics'].find_one({'_id': ObjectId(tag['subtopic_id'])}, {'name': 1})
                question['subtopicName'] = subtopic['name'] if subtopic else None
    
    return unique_questions

def get_question_batch(filters: Dict[str, Any]) -> Dict[str, Any]:
    """Get batch of questions with validation"""
    limit = filters.get("limit") or config.QUESTIONS_PER_REQUEST
    questions = fetch_questions(filters, limit)
    
    return {
        "status": "success",
        "count": len(questions),
        "requested": limit,
        "filters": {
            "difficulty": Difficulty(filters["difficulty"]).name,
            "type": QuestionType(filters["type"]).name
        },
        "questions": questions
    }
