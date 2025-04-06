# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


Start project: 
1) Change the working directory to a folder containing docker-compose.yml file
2) Run docker-compose up -d --build


Environment variables:

1) POSTGRES_USER=admin
2) POSTGRES_PASSWORD=securepass123
3) POSTGRES_DB=appdb
4) POSTGRES_PORT=5432
5) LOCAL_PG_DATA=./postgres_data
6) PGDATA=/var/lib/postgresql/data/pgdata


Main python backend requirements located at file /backend/requirements.txt

