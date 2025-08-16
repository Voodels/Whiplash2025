"""
Material Generator Service: HTTP microservice to generate study material/notes for each topic using Gemini.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from common.ai_utils import call_ai
import json
import re
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for development

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the Material Generator service"""
    return jsonify({
        'service': 'Material Generator',
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'POST /generate_material': 'Generate study material',
            'GET /health': 'Service health check'
        }
    }), 200

STUDY_PLAN_PROMPT = (
    "You are a study planner assistant. Given a topic, number of days, start date, and daily hours, "
    "distribute the key subtopics to study for the topic, assigning each day a subtopic. "
    "Respond ONLY as a JSON object mapping dates (YYYY-MM-DD) to the subtopic(s) to study on that day. "
    "Do not include any explanation or extra text. Example: {\"2025-04-27\": \"Intro to ML\", \"2025-04-28\": \"Supervised Learning\"}"
)

@app.route('/generate_material', methods=['POST'])
def generate_material():
    data = request.json
    topic_name = data.get('topic_name')
    no_of_days = data.get('no_of_days')
    start_date = data.get('start_date')
    daily_hours = data.get('daily_hours')
    api_key = data.get('api_key')  # Get API key from request

    # Validate input
    if not all([topic_name, no_of_days, start_date, daily_hours]):
        return jsonify({'error': 'Missing required fields'}), 400

    prompt = (
        f"Topic: {topic_name}. Number of days: {no_of_days}. Start date: {start_date}. Daily hours: {daily_hours}. "
        + STUDY_PLAN_PROMPT
    )
    try:
        # For testing, return a mock response instead of calling the AI
        mock_plan = {
            "2025-08-05": "Introduction to Python Programming",
            "2025-08-06": "Python Data Types and Variables",
            "2025-08-07": "Control Flow and Functions in Python"
        }
        
        # Uncomment this to use the real AI call
        # plan_str = call_ai(prompt, api_key=api_key, provider=request.json.get('provider', 'openai'))
        # cleaned = re.sub(r'^```(?:json)?\s*|\s*```$', '', plan_str.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
        # plan = json.loads(cleaned)
        
        plan = mock_plan  # Using mock response for now
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate study material',
            'details': str(e),
            'request_data': {
                'topic': topic_name,
                'days': no_of_days,
                'start_date': start_date,
                'daily_hours': daily_hours
            }
        }), 500

    response = {
        "daily_hours": daily_hours,
        "no_of_days": no_of_days,
        "start_date": start_date,
        "topic_name": topic_name,
        "plan": plan,
        "status": "Gemini study plan generated"
    }
    return jsonify(response)

if __name__ == "__main__":
    print("Starting Material Generator on port 5102...")
    app.run(host="0.0.0.0", port=5102, debug=False)
