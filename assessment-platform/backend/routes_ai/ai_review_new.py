from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from google import genai
from google.genai import types
import os

router = APIRouter(prefix="/api/practice", tags=["ai-review"])

# Initialize client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# --- 1. KEEPING YOUR EXACT INPUT SCHEMA ---
class Question(BaseModel):
    questionText: str
    status: Literal['correct', 'wrong', 'skipped']
    correctAnswer: str
    userAnswer: Optional[str] = None

class AIReviewRequest(BaseModel):
    totalQuestions: int
    correctAnswers: int
    wrongAnswers: int
    skippedQuestions: int
    questions: List[Question]

# --- 2. INTERNAL HELPERS (For AI Structure Only) ---
# These ensure the AI output matches your desired "insights" format exactly.
class InsightItem(BaseModel):
    category: str = Field(description="Short category name (e.g., Knowledge Gap)")
    message: str = Field(description="Actionable advice under 2 sentences")

class ReviewResponseSchema(BaseModel):
    insights: List[InsightItem]

@router.post("/ai-review")
async def ai_review(request: AIReviewRequest):
    try:
        # Prepare the context for the AI
        attempted = request.correctAnswers + request.wrongAnswers
        accuracy = (request.correctAnswers / attempted * 100) if attempted > 0 else 0
        
        # We format the string to be more descriptive for the AI, 
        # but this does not change the API input/output.
        wrong_qs = [q for q in request.questions if q.status == 'wrong'][:3]
        wrong_text = "\n".join([
            f"Q: {q.questionText[:100]}...\n   User Chose: '{q.userAnswer}' (Incorrect)\n   Correct: '{q.correctAnswer}'"
            for q in wrong_qs
        ]) if wrong_qs else "No wrong answers available."
        
        # High-performance prompt
        prompt = f"""
        Analyze this student's practice test.
        Performance: {accuracy:.0f}% accuracy. {request.skippedQuestions} skipped.
        
        MISTAKES:
        {wrong_text}

        TASK:
        Provide exactly 2 actionable insights. 
        If specific mistakes are listed above, explain the concept the user missed (a 'micro-lesson').
        If no specific mistakes, provide general strategy advice.

        Constraint: Keep messages short (under 30 words).
        """

        # Call Gemini with strict schema enforcement (Disables "thinking"/chatty filler)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ReviewResponseSchema,
                temperature=0.3,
            )
        )

        # Parse the structured response
        # We handle both raw text and parsed object for SDK safety
        if hasattr(response, 'parsed'):
            result = response.parsed
        else:
            result = ReviewResponseSchema.model_validate_json(response.text)

        # Convert back to simple dicts to match your original output format
        final_insights = [i.model_dump() for i in result.insights]

        # Fallback if AI returns fewer than 2 items (rare with schema enforcement)
        if len(final_insights) < 2:
            final_insights.append({"category": "Practice", "message": "Keep practicing to generate more data."})
        
        # --- 3. RETURNING EXACTLY THE SAME OUTPUT STRUCTURE ---
        return {"status": "success", "insights": final_insights[:2]}

    except Exception as e:
        # It is good practice to log the actual error to console/file
        print(f"AI Review Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI review failed: {str(e)}")