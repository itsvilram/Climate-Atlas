# Backend phase 1

Install with `pip install -e "./backend[dev]"`. Configure only the ignored backend/.env for Atlas; .env.example contains placeholders. Run `python -m uvicorn app.main:app --app-dir backend --no-proxy-headers --no-access-log`. Weather and persistence verification are opt-in. No climate results are available yet.
