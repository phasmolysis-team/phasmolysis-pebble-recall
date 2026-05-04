# Pebble ReCall 🪨

_A low-friction mental health managing and tracking system. Making psychiatric care more accessible._

## Initial setup

Requires [direnv](https://direnv.net/) and [nix](https://nixos.org).

```bash
mkdir -p ~/.config/direnv
# Either copy or append the layout script
cat $PROJECT_PATH/.direnv.uv >> ~/.config/direnv/direnvrc
direnv allow
```

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

