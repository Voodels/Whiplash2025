# Microservices Backend

This folder contains Flask-based microservices and a simple runner script.

## Services and Ports
- MCP Server: http://localhost:5101
- Material Generator: http://localhost:5102
- Video Fetcher: http://localhost:5103
- Quiz Generator: http://localhost:5104

## Setup
```bash
cd microservices_backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then edit keys
python run_all.py
```

## Env
Copy `.env.example` to `.env` and fill in:
```
GEMINI_API_KEY=...       # Optional for Gemini calls
YOUTUBE_API_KEY=...      # Required for Video Fetcher real results
MONGO_URI=mongodb://localhost:27017/WhipLash
```

## Health checks
```bash
curl -sS http://localhost:5101/health
curl -sS http://localhost:5102/health
curl -sS http://localhost:5103/health
curl -sS http://localhost:5104/health
```

## Sample requests
```bash
# Material Generator (returns mock plan)
curl -sS -X POST http://localhost:5102/generate_material \
  -H 'Content-Type: application/json' \
  -d '{"topic_name":"Python Basics","no_of_days":3,"start_date":"2025-08-15","daily_hours":2}'

# Video Fetcher (uses YouTube API)
curl -sS -X POST http://localhost:5103/fetch_videos \
  -H 'Content-Type: application/json' \
  -d '{"topic_name":"Python Programming","plan":{"2025-08-15":"Intro to Python","2025-08-16":"Data Types"},"daily_hours":1,"target_days":2}'

# Quiz Generator (fallback templates if no AI key)
curl -sS -X POST http://localhost:5104/generate_quiz_and_assignments \
  -H 'Content-Type: application/json' \
  -d '{"subtopic":"Intro to Python","study_notes":"Basics of Python variables and print."}'
```

## Logs
- All logs are written under `logs/` by `run_all.py`.
- On startup failures, `run_all.py` tails the last lines automatically.

## Troubleshooting
- Ensure virtualenv is active when running.
- Verify `.env` keys (esp. `YOUTUBE_API_KEY`).
- MongoDB must be running for MCP Server.
