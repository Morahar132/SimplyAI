from enum import IntEnum

class QuestionType(IntEnum):
    MCQ = 0
    MULTIPLE_MCQ = 1
    NUMBER = 2
    FILL_BLANKS = 3
    ASSERTION = 4
    TRUE_FALSE = 5
    SUBJECTIVE = 6

class Difficulty(IntEnum):
    EASY = 0
    MEDIUM = 1
    HARD = 2

# Question type labels for API documentation
QUESTION_TYPE_LABELS = {
    QuestionType.MCQ: "Single Choice MCQ",
    QuestionType.MULTIPLE_MCQ: "Multiple Choice MCQ",
    QuestionType.NUMBER: "Numerical Answer",
    QuestionType.FILL_BLANKS: "Fill in the Blanks",
    QuestionType.ASSERTION: "Assertion-Reason",
    QuestionType.TRUE_FALSE: "True/False",
    QuestionType.SUBJECTIVE: "Subjective"
}

DIFFICULTY_LABELS = {
    Difficulty.EASY: "Easy",
    Difficulty.MEDIUM: "Medium",
    Difficulty.HARD: "Hard"
}
