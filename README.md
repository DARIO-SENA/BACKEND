# DARIO API - Asistente Personal de Productividad

API REST para gestión de hábitos, tareas, agenda, finanzas, pomodoro, gym, gamificación e integraciones.

## Stack

- **Runtime:** Node.js 24
- **Framework:** Express 5
- **Base de datos:** PostgreSQL 16
- **Cache/Colas:** Redis 7 + BullMQ
- **ORM Migraciones:** node-pg-migrate

## Requisitos

- Node.js >= 18
- PostgreSQL 16
- Redis 7
- npm

## Instalación

```bash
git clone <repo-url>
cd backend
cp .env.example .env   # Completar variables
npm install
npm run migrate:up     # Crear tablas en BD
npm run dev            # Iniciar servidor
```

## Variables de Entorno

Ver `.env.example` para todas las variables requeridas.

Principales:
| Variable | Descripción |
|----------|-------------|
| `DB_HOST` | Host de PostgreSQL |
| `DB_PASSWORD` | Contraseña de BD |
| `JWT_SECRET` | Secreto para tokens JWT |
| `REDIS_HOST` | Host de Redis |
| `DATABASE_URL` | URL completa de conexión a BD |
| `OPENAI_API_KEY` | API key de OpenAI (módulo IA) |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor con nodemon |
| `npm start` | Iniciar servidor en producción |
| `npm test` | Ejecutar tests |
| `npm run migrate:up` | Ejecutar migraciones pendientes |
| `npm run migrate:down` | Revertir última migración |
| `npm run migrate:create` | Crear nueva migración |

## Docker

```bash
docker compose up -d
```

Levanta: PostgreSQL, Redis, pgAdmin (puerto 5050), migraciones automáticas y API en puerto 3000.

## Módulos

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| Auth | `/api/auth` | Registro, login, perfil |
| Tareas | `/api/tareas` | CRUD, filtros, agenda |
| Hábitos | `/api/habitos` | CRUD, registro diario |
| Agenda | `/api/agenda` | Bloques de tiempo, agenda diaria |
| Recordatorios | `/api/recordatorios` | CRUD, notificaciones, preferencias |
| Pomodoro | `/api/pomodoro` | Temporizador, sesiones, estadísticas |
| Finanzas | `/api/finanzas` | Transacciones, cuentas, presupuestos, metas, deudas |
| Gym | `/api/gym` | Rutinas, ejercicios, entrenamientos |
| Social | `/api/social` | Amistades, proyectos, tareas compartidas |
| Gamificación | `/api/gamificacion` | Perfil, logros, ranking |
| IA | `/api/ia` | Chat, predicciones, recomendaciones |
| Analytics | `/api/analytics` | Reportes, estadísticas |
| Integraciones | `/api/integraciones` | Google Calendar, WhatsApp |

## API Docs

Swagger UI disponible en `/api-docs` (servidor corriendo).

## Tests

```bash
npm test
```

## Estructura del Proyecto

```
src/
├── app.js                 # Configuración Express
├── server.js              # Punto de entrada
├── config/                # Configuración (DB, Redis, Swagger)
├── eventBus/              # Sistema de eventos
├── middlewares/            # Middleware (auth, errores)
├── modules/               # Módulos (cada uno con service/controller/routes)
│   ├── auth/
│   ├── tareas/
│   ├── habitos/
│   ├── agenda/
│   ├── recordatorios/
│   ├── pomodoro/
│   ├── finanzas/
│   ├── gym/
│   ├── social/
│   ├── gamificacion/
│   ├── ia/
│   ├── analytics/
│   └── integraciones/
└── utils/                 # Utilidades compartidas
migrations/                # Migraciones de BD
scripts/                   # Scripts (migrate, utilidades)
```
