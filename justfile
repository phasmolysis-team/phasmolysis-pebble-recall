set dotenv-load := true
set dotenv-path := 'backend/.env'

[parallel]
default: serve-api serve-client reverse-proxy

serve-api:
	just backend/serve

serve-client:
	cd frontend && npm run dev

reverse-proxy:
	caddy run

compose-up +args="":
	docker compose --env-file backend/.env up {{args}}
