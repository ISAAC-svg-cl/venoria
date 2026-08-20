# VENORIA Backend

API Express TypeScript avec PostgreSQL et sessions JWT HTTP-only.

## Développement

1. Copier `.env.example` vers `.env`.
2. Démarrer PostgreSQL et renseigner `DATABASE_URL`.
3. Lancer `npm install`, puis `npm run dev`.

L’administrateur initial est créé au premier démarrage avec `ADMIN_EMAIL` et `ADMIN_PASSWORD`.

## Production

Définir obligatoirement `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD` et `FRONTEND_URL`. Ne jamais utiliser les valeurs d’exemple en production.

Endpoints disponibles :

- `GET /health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
