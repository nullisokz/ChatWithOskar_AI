# Project: "Ask Me Anything" — AI Chat Widget (Standalone Test Repo)

## Goal
A small, polished chat widget where visitors can ask questions and get answers "as Oskar" —
based on a curated set of facts about background, projects, skills, and personality.
This is step 1: a **standalone project** to build and test the concept before integrating
it into the main portfolio repo (www.oskarkrantz.se).

Purpose: show Swedish tech recruiters a project that's technically solid *and* reflects
personality — friendly, thoughtful, a little fun.

---

## Scope (keep tight — a few hours of focused work)

- One page, one feature: chat interface + AI backend.
- No auth, no database (facts live in a static file).
- No streaming required for v1 (nice-to-have, not required).
- No integration into the portfolio yet — this is a self-contained repo.

---

## Architecture

### Frontend — React + Vite
- Single page (`/`) with:
  - Chat message list (user + assistant bubbles)
  - Input box + send button
  - 3–4 clickable "starter question" chips, e.g.:
    - "What are you working on right now?"
    - "Why did you get into AI/software?"
    - "What's your favorite project you've built?"
    - "What are you like to work with?"
  - Simple typing/loading indicator while waiting for a reply
- Clean, warm visual design — this is a personality showcase as much as a tech demo.
  Typography and tone matter. Keep it minimal, avoid generic "AI chatbot" styling.
- Store chat history in local component state only (no persistence needed for v1).

### Backend — Python API
- Framework: FastAPI (recommended — fast to set up, good docs, async-friendly)
- One endpoint:
  ```
  POST /api/chat
  Request:  { "message": string, "history": [{role, content}, ...] }
  Response: { "reply": string }
  ```
- Loads a **facts file** (see below) into the system prompt at request time.
- Calls the Google Gemini API (`gemini-2.5-flash`) server-side. (Plan originally called for
  the Anthropic API; the implementation shipped with Gemini instead.)
  - API key stored in an environment variable, NEVER exposed to the frontend.
- Basic guardrails:
  - Cap incoming message length (e.g. 500 chars)
  - Cap conversation history length sent to the model (e.g. last 10 messages)
  - System prompt explicitly instructs the model to:
    - Answer in first person, as Oskar, warm and honest tone
    - Only use the provided facts — no invented biographical details
    - Gracefully decline out-of-scope questions (e.g. "That's not something I've shared here,
      but feel free to reach out directly!") rather than guessing
    - Keep answers short and conversational (2–4 sentences typically)

### Facts file
- `facts.md` or `facts.json` in the backend, containing curated info:
  - Background / how you got into tech
  - Current focus / interests
  - A few projects with a sentence or two each
  - Working style / values (what recruiters would want to know about "what it's like to
    work with you")
  - A couple of fun/personal details (hobbies, something quirky) — this is where the
    "nice and decent person" signal comes through
- Keep it honest and specific — vague corporate-sounding facts will make the bot sound flat.

---

## Tech stack summary

| Layer      | Choice                                    |
|------------|--------------------------------------------|
| Frontend   | React + Vite                              |
| Backend    | Python (FastAPI)                          |
| LLM        | Google Gemini API — `gemini-2.5-flash`    |
| Data       | Static facts file (md/json), no DB for v1 |
| Hosting    | Local/Codespaces only for now (v1 test)   |

---

## Steps

1. Scaffold repo: `frontend/` (Vite React app) + `backend/` (FastAPI app)
2. Backend: build `/api/chat` endpoint, wire up Anthropic API call, load facts file into system prompt
3. Write `facts.md` with real content about yourself
4. Frontend: build chat UI (message list, input, starter chips, loading state)
5. Connect frontend to backend locally (CORS enabled for local dev)
6. Test conversation quality — tune the system prompt and facts file based on how it responds
7. Polish styling/visual design
8. Take screenshots of a few good example conversations
9. (Later, separate step) Integrate into the portfolio repo — reuse the chat component,
   add a corresponding endpoint/service to the portfolio's existing Python API

---

## Guardrail checklist before calling it done
- [ ] API key is server-side only, not committed to the repo (`.env`, gitignored)
- [ ] Message length capped
- [ ] System prompt prevents fabricated personal details
- [ ] Off-topic / inappropriate questions handled gracefully (not silently ignored, not
      spiraling into a weird tangent)
- [ ] Empty/very short messages handled without breaking the UI

---

## Explicitly out of scope for v1
- Persisting chat logs
- Rate limiting / abuse protection (add before making it public-facing on the real portfolio)
- Streaming responses
- Authentication
- Integration into the live portfolio repo
