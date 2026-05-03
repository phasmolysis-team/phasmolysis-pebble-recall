[parallel]
default: serve-api serve-client reverse-proxy

serve-api:
	just backend/serve

serve-client:
	cd frontend && npm run dev

reverse-proxy:
	caddy run

