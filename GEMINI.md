# ForHereOrder

A full-stack web application designed for food ordering and vendor management.

## Project Overview

- **Frontend:** React (TypeScript) + Vite + Tailwind CSS
- **Backend:** Laravel (PHP)
- **Architecture:** Decoupled frontend/backend with RESTful API communication.

## Directories

- `client/`: React frontend application.
- `server/`: Laravel backend API and application logic.

## Building and Running

### Frontend (`client/`)
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

### Backend (`server/`)
- **Development Server:** `php artisan serve`
- **Migrations:** `php artisan migrate`

## Development Conventions

- **Frontend:**
  - TypeScript for type safety.
  - Functional components with hooks.
  - Component-based architecture (`src/components/`).
  - API interactions via `axios` (`src/api/`).
- **Backend:**
  - Standard Laravel MVC structure.
  - API versioning under `app/Http/Controllers/API/v1/`.
  - Use of Form Requests and API Resources for validation and data transformation.
