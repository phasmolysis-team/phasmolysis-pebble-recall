# Pebble Recall 🪨

_A low-friction mental health managing and tracking system. Making psychiatric care more accessible._

> [!NOTE]
> Project used the following project template <https://codeberg.org/uncomfyhalomacro/fullstack-fastapi-template/>
> licensed under [WTFPL](https://www.wtfpl.net/).

## Initial setup

Requires [direnv](https://direnv.net/) and [nix](https://nixos.org).

```bash
mkdir -p ~/.config/direnv
# Either copy or append the layout script
cat $PROJECT_PATH/.direnv.uv >> ~/.config/direnv/direnvrc
direnv allow
```

## Docker

```bash
cp backend/.env.example backend/.env
```

Adjust variables accordingly

```bash
docker compose --env-file=backend/.env up --build
```

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `HOST` | Server host | `localhost` |
| `PORT` | Server port | `8080` |
| `PG_URL` | Full database connection string | |
| `ORIGINS` | CORS allowed origins (comma-separated) | |
| `API_ROOT` | Base path for API routes | `/api` |
| `AUTH__JWT_SECRET` | Fernet key for JWT signing | |
| `AUTH__COOKIE_SECRET` | Fernet key for cookie encryption | |

Generate Fernet keys with:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

That's it

## For Non Nix Setups

**Fedora**

```bash
sudo dnf install -y postgresql postgresql-server postgresql-contrib uv nodejs just caddy
```

**Ubuntu/Debian**

```bash
sudo apt install -y postgresql uv nodejs just caddy
```

### Setup

Copy `Caddyfile.example`

```bash
cp ./Caddyfile.example ./Caddyfile
```

#### Backend

```bash
cd backend
cp .env.example .env
```

Inside the `backend` directory

```bash
uv sync
```

#### Frontend

```bash
cd frontend
```

Inside the `frontend` directory

```bash
npm install
```

### Running the app

Both

```bash
just default
```

Backend only

```bash
cd backend
just serve
```

Frontend only

```bash
cd frontend
npm run dev
```

## Setting up the database

```bash
cd backend
just start-db
```

Open a new terminal

```bash
just create-db
```

### Troubleshooting

permission denied on `/var/log/`

In `./pgdata/postgresql.conf`, set this var to `/tmp` or any writeable directory

```
unix_socket_directories = "/tmp"
```

