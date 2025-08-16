#!/usr/bin/env python3
"""
Quiz Generator Microservice

This service generates quizzes based on provided content using AI.
"""
import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent.absolute())
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from quiz_generator.service import QuizGeneratorService

def main():
    """Run the quiz generator service."""
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Create and run the service
    service = QuizGeneratorService()
    service.run(debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true')

def print_banner():
    # This function is not defined in the original code, 
    # so I'm assuming it's defined elsewhere in the project
    pass

if __name__ == "__main__":
    main()
