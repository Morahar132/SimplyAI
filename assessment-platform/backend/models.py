from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from enums import QuestionType, Difficulty

class QuestionFilters(BaseModel):
    courseId: str = Field(..., pattern=r'^[a-fA-F0-9]{24}$', description="24-character MongoDB ObjectId")
    subjectId: Optional[str] = Field(None, pattern=r'^[a-fA-F0-9]{24}$', description="24-character MongoDB ObjectId")
    topicIds: List[str] = Field(default_factory=list)
    subtopicIds: List[str] = Field(default_factory=list)
    difficulty: int = Field(..., ge=0, le=2, description="0=Easy, 1=Medium, 2=Hard")
    type: int = Field(..., ge=0, le=6, description="0=MCQ, 1=Multiple MCQ, 2=Number, 3=Fill Blanks, 4=Assertion, 5=True/False, 6=Subjective")
    limit: Optional[int] = Field(None, ge=1, le=25, description="Number of questions to fetch (1-25, default 25)")
    
    @field_validator('courseId', 'subjectId')
    @classmethod
    def validate_objectid(cls, v):
        if v and (not isinstance(v, str) or len(v) != 24):
            raise ValueError(f'Invalid ObjectId: "{v}". Must be a 24-character hex string (e.g., "5e12bc386ed15e08c72f429b")')
        return v
    
    @field_validator('topicIds', 'subtopicIds')
    @classmethod
    def validate_objectid_list(cls, v):
        for item in v:
            if not isinstance(item, str) or len(item) != 24:
                raise ValueError(f'Invalid ObjectId in list: "{item}". Must be a 24-character hex string')
        return v
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "courseId": "5e12bc386ed15e08c72f429b",
                "subjectId": "5e12bc3e6ed15e08c72f429c",
                "topicIds": ["5e12bca90a53d808cd8a072b"],
                "subtopicIds": [],
                "difficulty": 1,
                "type": 0,
                "limit": 10
            }
        }
    }
