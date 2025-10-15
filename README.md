# Week 2 Assignment — Products API

Brief Express API for managing products. Supports in-memory product store (with helpers) and optional MongoDB via Mongoose. Features: global error handling, async route wrapper, filtering, search, pagination and simple statistics.

## Prerequisites
- Node.js v16+ (tested on Node 22)
- npm
- (optional) MongoDB and a MONGO_URI if you want persistence

## Install
Open PowerShell or CMD in the project folder:
```powershell
npm install
```

## Environment
Create a `.env` file at project root (optional):
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mydb   # optional
DB_REQUIRED=false
```

## Run
Start in development:
```powershell
npm run dev
```

## Available endpoints
Base URL: http://localhost:3000

- GET /                     — service info
- GET /health               — health check
- GET /api/keys-info        — sample API keys for testing
- GET /api/products         — list products (supports query params)
  - Query params:
    - category=Electronics
    - search=term or q=term
    - page=1
    - limit=10
- GET /api/products/search?q=term — search products by name/description
- GET /api/products/stats         — product statistics (count by category, inStock)
- GET /api/products/:id           — get product by id
- POST /api/products              — create product (JSON body)
- PUT /api/products/:id           — update product
- DELETE /api/products/:id        — delete product

Request/response format: JSON.

## Error handling
- Centralized error classes (AppError, NotFoundError, ValidationError)
- Global error handler returns appropriate HTTP status codes and JSON error body
- Async route wrapper used to catch/rethrow async errors

## Data model / storage
- models/product.js exposes a Mongoose model `Product` (if using MongoDB) and in-memory helpers (`products`, addProduct, updateProduct, deleteProduct, getAllProducts`) used by routes by default.
- If MONGO_URI is set and connection succeeds, you can update routes to use the Mongoose model instead of in-memory helpers.

## Project structure (important files)
- server.js
- routes/products.js
- models/product.js
- middleware/errors.js
- middleware/validation.js
- middleware/logger.js (optional)
- package.json

## Notes
- If you see missing-module errors, run `npm install` for the missing package (e.g., helmet, cors).
- The 404 handler uses a no-path `app.use(...)` to avoid path-to-regexp issues on some environments.
- Keep middleware exports as functions (or adjust server.js defensive loaders).

## Testing
- Exported `app` allows integration tests (supertest). Start server via `npm run dev` for manual testing.

License: ISC