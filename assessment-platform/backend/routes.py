from fastapi import APIRouter, HTTPException, status
from models import QuestionFilters
from service import get_question_batch
from bson import ObjectId
from db import get_db
from enums import QuestionType, Difficulty, QUESTION_TYPE_LABELS, DIFFICULTY_LABELS

router = APIRouter(prefix="/api", tags=["questions"])

def convert_objectids(doc):
    """Recursively convert all ObjectId fields to strings"""
    if isinstance(doc, list):
        return [convert_objectids(item) for item in doc]
    elif isinstance(doc, dict):
        return {key: str(val) if isinstance(val, ObjectId) else convert_objectids(val) for key, val in doc.items()}
    return doc

@router.get("/enums/question-types")
async def get_question_types():
    """Get all available question types"""
    return {
        "status": "success",
        "questionTypes": [
            {"value": qt.value, "label": QUESTION_TYPE_LABELS[qt], "name": qt.name}
            for qt in QuestionType
        ]
    }

@router.get("/enums/difficulties")
async def get_difficulties():
    """Get all difficulty levels"""
    return {
        "status": "success",
        "difficulties": [
            {"value": d.value, "label": DIFFICULTY_LABELS[d], "name": d.name}
            for d in Difficulty
        ]
    }

@router.get("/courses")
async def get_courses():
    """Get all available courses"""
    db = get_db()
    courses = list(db["courses"].find(
        {"isHidden": {"$ne": True}},
        {"_id": 1, "name": 1, "slug": 1, "category": 1}
    ))
    for c in courses:
        c["_id"] = str(c["_id"])
    return {"status": "success", "courses": courses}

@router.get("/courses/{course_id}/subjects")
async def get_subjects(course_id: str):
    """Get subjects for a course"""
    try:
        if len(course_id) != 24:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid course_id format. Expected 24-character hex string, got '{course_id}'"
            )
        
        db = get_db()
        subjects = list(db["subjects"].find(
            {"courseId": ObjectId(course_id), "isArchived": {"$ne": True}},
            {"_id": 1, "name": 1, "questionsCount": 1, "courseId": 1}
        ))
        for s in subjects:
            s["_id"] = str(s["_id"])
            if "courseId" in s:
                s["courseId"] = str(s["courseId"])
        return {"status": "success", "subjects": subjects}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching subjects: {str(e)}"
        )

@router.get("/subjects/{subject_id}/topics")
async def get_topics(subject_id: str):
    """Get topics (parent topics only) for a subject"""
    try:
        if len(subject_id) != 24:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid subject_id format. Expected 24-character hex string, got '{subject_id}'"
            )
        
        db = get_db()
        topics = list(db["topics"].find(
            {
                "subjectId": ObjectId(subject_id),
                "parentTopicId": None,
                "isArchived": {"$ne": True},
                "availableQuestionTypes": {"$exists": True, "$ne": []}
            },
            {"_id": 1, "name": 1, "questionsCount": 1, "priority": 1, "subjectId": 1}
        ).sort("priority", 1))
        for t in topics:
            t["_id"] = str(t["_id"])
            if "subjectId" in t:
                t["subjectId"] = str(t["subjectId"])
        return {"status": "success", "topics": topics}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching topics: {str(e)}"
        )

@router.get("/topics/{topic_id}/subtopics")
async def get_subtopics(topic_id: str):
    """Get subtopics for a topic"""
    try:
        if len(topic_id) != 24:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid topic_id format. Expected 24-character hex string, got '{topic_id}'"
            )
        
        db = get_db()
        subtopics = list(db["topics"].find(
            {
                "parentTopicId": ObjectId(topic_id),
                "isArchived": {"$ne": True}
            },
            {"_id": 1, "name": 1, "questionsCount": 1, "priority": 1, "parentTopicId": 1}
        ).sort("priority", 1))
        for st in subtopics:
            st["_id"] = str(st["_id"])
            if "parentTopicId" in st:
                st["parentTopicId"] = str(st["parentTopicId"])
        return {"status": "success", "subtopics": subtopics}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching subtopics: {str(e)}"
        )

@router.get("/topics/fetch-by-subject/{subject_id}")
async def get_topics_with_subtopics(subject_id: str):
    """Get all topics with embedded subtopics for a subject (Drona pattern)"""
    try:
        if len(subject_id) != 24:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid subject_id format. Expected 24-character hex string, got '{subject_id}'"
            )
        
        db = get_db()
        pipeline = [
            {
                "$match": {
                    "subjectId": ObjectId(subject_id),
                    "parentTopicId": None,
                    "isArchived": {"$ne": True},
                    "availableQuestionTypes": {"$exists": True, "$ne": []}
                }
            },
            {
                "$lookup": {
                    "from": "topics",
                    "localField": "_id",
                    "foreignField": "parentTopicId",
                    "as": "subtopics"
                }
            },
            {
                "$addFields": {
                    "subtopics": {
                        "$filter": {
                            "input": "$subtopics",
                            "as": "st",
                            "cond": {"$ne": ["$$st.isArchived", True]}
                        }
                    }
                }
            },
            {"$sort": {"priority": 1}}
        ]
        
        topics = list(db["topics"].aggregate(pipeline))
        topics = convert_objectids(topics)
        
        return {"status": "success", "topics": topics}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching topics: {str(e)}"
        )

@router.get("/assets/{asset_id}")
async def get_asset(asset_id: str):
    """Get asset URL or data"""
    try:
        db = get_db()
        asset = db["assets"].find_one({"_id": ObjectId(asset_id)})
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        return {
            "status": "success",
            "asset": {
                "_id": str(asset["_id"]),
                "url": asset.get("url", ""),
                "type": asset.get("type", "image"),
                "name": asset.get("name", "")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching asset: {str(e)}"
        )

@router.post("/questions/fetch")
async def fetch_questions(filters: QuestionFilters):
    """Fetch questions based on filters"""
    try:
        result = get_question_batch(filters.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching questions: {str(e)}"
        )
