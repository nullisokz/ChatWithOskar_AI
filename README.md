# ChatWithOskar_AI — "Ask Me Anything" chat widget

Standalone prototype of an AI chat widget for [oskarkrantz.se](https://www.oskarkrantz.se) where
visitors can ask questions and get answers "as Oskar," grounded in a curated facts file.

See [ask-me-anything-plan.md](ask-me-anything-plan.md) for the full plan.

## Structure

- `backend/` — FastAPI app exposing `POST /api/chat`, backed by the Google Gemini API and
  `backend/facts.md`.
- `frontend/` — Vite + React chat UI.

`backend/facts.md` now holds real facts about Oskar, sourced from his CV.

## Running locally

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your GOOGLE_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend

Requires Node.js `^20.19` or `>=22.12` (Vite 8's engine requirement).

```bash
cd frontend
npm install
cp .env.example .env   # optional, defaults to http://localhost:8000
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).
