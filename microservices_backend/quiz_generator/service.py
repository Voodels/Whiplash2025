from typing import Dict, Any, Optional
from flask import request
from common.base_service import BaseService
from common.ai_utils import call_ai
import os
import json

class QuizGeneratorService(BaseService):
    def __init__(self):
        super().__init__(
            service_name="quiz_generator",
            default_port=5104
        )
        self._register_routes()
        self.required_fields = ['topic', 'content']
    
    def _register_routes(self):
        """Register all API endpoints."""
        @self.route('/generate', methods=['POST'])
        def generate_quiz():
            return self._handle_generate_quiz()
        
        @self.route('/health', methods=['GET'])
        def health():
            return self.success_response({"status": "healthy"})

        # Compatibility endpoint used by MCP server
        @self.route('/generate_quiz_and_assignments', methods=['POST'])
        def generate_quiz_and_assignments():
            return self._handle_generate_quiz_and_assignments()
    
    def _handle_generate_quiz(self):
        """Handle quiz generation request."""
        try:
            data = request.get_json()
            
            # Validate request
            is_valid, error_msg = self.validate_required_fields(data, self.required_fields)
            if not is_valid:
                return self.error_response(error_msg or "Missing required fields", 400)
            
            # Get API key and provider from request or environment
            api_key = data.get('api_key') or os.getenv('DEFAULT_AI_API_KEY')
            provider = data.get('provider', 'openai')
            
            if not api_key:
                return self.error_response("API key is required", 400)
            
            # Generate quiz using AI
            quiz = self._generate_quiz_ai(
                topic=data['topic'],
                content=data['content'],
                difficulty=data.get('difficulty', 'medium'),
                num_questions=data.get('num_questions', 5),
                api_key=api_key,
                provider=provider
            )
            
            return self.success_response({
                'quiz': quiz,
                'metadata': {
                    'topic': data['topic'],
                    'num_questions': data.get('num_questions', 5),
                    'difficulty': data.get('difficulty', 'medium')
                }
            })
            
        except Exception as e:
            self.logger.exception("Error generating quiz")
            return self.error_response("Failed to generate quiz", 500, error=str(e))

    def _handle_generate_quiz_and_assignments(self):
        """Compatibility handler expected by MCP. Returns quizzes and assignments."""
        try:
            data = request.get_json() or {}
            subtopic = data.get('subtopic') or data.get('topic')
            notes = data.get('study_notes') or data.get('content') or ''
            difficulty = data.get('difficulty', 'medium')
            num_questions = int(data.get('num_questions', 5))

            if not subtopic:
                return self.error_response("'subtopic' is required", 400)

            api_key = data.get('api_key') or os.getenv('DEFAULT_AI_API_KEY')
            provider = data.get('provider', 'openai')

            quizzes: list[Dict[str, Any]] = []
            assignments: list[Dict[str, Any]] = []

            # Try AI-backed generation; fall back to simple templates if no API key
            try:
                if api_key:
                    quiz_data = self._generate_quiz_ai(
                        topic=subtopic,
                        content=notes or f"Generate questions about {subtopic}",
                        difficulty=difficulty,
                        num_questions=num_questions,
                        api_key=api_key,
                        provider=provider
                    )
                    quizzes = quiz_data.get('questions', []) if isinstance(quiz_data, dict) else []
                else:
                    # Fallback quizzes
                    quizzes = [
                        {
                            "question": f"Briefly explain: {subtopic}?",
                            "options": ["Definition", "Example", "Both", "Neither"],
                            "correct_answer": 2,
                            "explanation": f"Covers basics of {subtopic}."
                        }
                    ]

                # Assignments (simple templates using notes if present)
                assignments = [
                    {
                        "title": f"Summarize {subtopic}",
                        "description": "Write a 1-2 paragraph summary and 3 key takeaways.",
                        "type": "written",
                    },
                    {
                        "title": f"Practical Task: {subtopic}",
                        "description": "Create a small example or mini-project demonstrating the concept.",
                        "type": "practical",
                    }
                ]

                return self.success_response({
                    'quizzes': quizzes,
                    'assignments': assignments
                })
            except Exception as e:
                self.logger.exception("Error generating quiz/assignments")
                # Even on failure, return graceful empty lists so MCP can continue
                return self.success_response({
                    'quizzes': quizzes,
                    'assignments': assignments
                })

        except Exception as e:
            self.logger.exception("Unexpected error in compatibility endpoint")
            return self.error_response("Failed to process request", 500, error=str(e))
    
    def _generate_quiz_ai(self, topic: str, content: str, difficulty: str, 
                         num_questions: int, api_key: str, provider: str) -> Dict[str, Any]:
        """Generate quiz questions using AI."""
        prompt = f"""Generate a {difficulty} difficulty quiz with {num_questions} questions about {topic}.
        The questions should be based on the following content:
        
        {content}
        
        Return the quiz in JSON format with the following structure:
        {{
            "questions": [
                {{
                    "question": "...",
                    "options": ["...", "...", "...", "..."],
                    "correct_answer": 0,
                    "explanation": "..."
                }}
            ]
        }}"""
        
        try:
            response = call_ai(
                prompt=prompt,
                model="gpt-3.5-turbo",
                api_key=api_key,
                provider=provider
            )
            
            # Parse and validate the response
            quiz_data = json.loads(response)
            self._validate_quiz_structure(quiz_data)
            
            return quiz_data
            
        except json.JSONDecodeError:
            self.logger.error("Failed to parse AI response as JSON")
            raise ValueError("Invalid response format from AI service")
        except Exception as e:
            self.logger.error(f"AI service error: {str(e)}")
            raise
    
    def _validate_quiz_structure(self, quiz_data: Dict[str, Any]):
        """Validate the structure of the generated quiz."""
        if not isinstance(quiz_data, dict):
            raise ValueError("Quiz data must be a dictionary")
            
        if 'questions' not in quiz_data or not isinstance(quiz_data['questions'], list):
            raise ValueError("Quiz must contain a 'questions' list")
            
        for i, question in enumerate(quiz_data['questions']):
            if not all(field in question for field in ['question', 'options', 'correct_answer', 'explanation']):
                raise ValueError(f"Question {i+1} is missing required fields")
                
            if not isinstance(question['options'], list) or len(question['options']) < 2:
                raise ValueError(f"Question {i+1} must have at least 2 options")
                
            if not 0 <= question['correct_answer'] < len(question['options']):
                raise ValueError(f"Question {i+1} has invalid correct_answer index")

# Create and run the service
if __name__ == '__main__':
    service = QuizGeneratorService()
    service.run(debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true')
