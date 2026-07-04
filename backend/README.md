# Backend

Express.js API for the distributed job scheduler.

## Highlights

- Secure JWT auth flow with refresh-token handling
- Modular service-oriented business logic for queues, jobs, retries, workers, and locks
- MySQL-backed persistence with Sequelize migrations and relational models
- Transactional worker claiming for reliability and concurrency safety
- Structured logging, validation, rate limiting, and global error handling
- Swagger/OpenAPI documentation and Jest/Supertest coverage

Important directories:

- `src/config`: environment, database, and runtime configuration
- `src/models`: Sequelize models and associations
- `src/database/migrations`: versioned MySQL schema
- `src/database/seeders`: sample production-like data
- `src/middlewares`: auth, RBAC, validation, logging, rate limiting, and errors
- `src/routes`: REST API routes
- `src/controllers`: HTTP request handlers
- `src/services`: business logic
- `src/socket`: Socket.IO setup
- `src/docs`: Swagger/OpenAPI setup
