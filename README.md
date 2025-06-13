# Cyberpoligon Services

This project bundles a small infrastructure consisting of a FastAPI backend, a React frontend and a PostgreSQL database.  The containers are orchestrated with **docker-compose**.

## Services

### db
* `postgres:15-alpine` image
* initialized by `postgres-init/postgres-init.sh`
* listens on host port **5433**

### backend
* located in `backend/`
* runs Alembic migrations and seeds initial data on start via `backend/entrypoint.sh`
* exposed on port **8000**

### worker
* same image and code base as the backend for background tasks
* exposed on port **8100**

### frontend
* React application in `frontend/`
* built with Vite and served on port **5173**

### nginx
* `nginx:stable-alpine` acting as a reverse proxy for the frontend and backend

### semaphore
* [Semaphore](https://github.com/ansible-semaphore/semaphore) for running Ansible playbooks
* stores data in the same PostgreSQL instance
* accessible on port **3000**

## Environment variables

Copy `env.example` to `.env` and adjust values as required.  Important variables include:

```
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=qweasdZXC123
DB_NAME=Npis
POSTGRES_USER=postgres
POSTGRES_PASSWORD=qweasdZXC123
POSTGRES_MULTIPLE_DATABASES=Npis,semaphore
SEMAPHORE_DB_DIALECT=postgres
SEMAPHORE_DB_NAME=semaphore
SEMAPHORE_DB_USER=postgres
SEMAPHORE_DB_PASS=qweasdZXC123
SEMAPHORE_DB_PORT=5432
SEMAPHORE_ADMIN=admin
SEMAPHORE_ADMIN_PASSWORD=changeme
SEMAPHORE_ADMIN_NAME=Admin
SEMAPHORE_ADMIN_EMAIL=admin@localhost
```

## Using docker-compose

Start all services from the project root:

```bash
docker-compose up -d --build
```

Stop and remove containers:

```bash
docker-compose down
```

## Running migrations

Migrations are executed automatically when the backend container starts.  To run them manually:

```bash
docker-compose exec backend alembic upgrade head
```

## Running tests

Ansible playbooks in `ansible/tests/` act as basic tests.  Execute them from inside the backend container, e.g.:

```bash
docker-compose exec backend ansible-playbook ansible/tests/test_ping.yml -i ansible/tests/inventory
```

There are currently no automated Python or frontend test suites.

Main Python requirements are listed in `backend/requirements.txt`.
