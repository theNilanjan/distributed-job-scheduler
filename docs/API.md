# API Documentation

Swagger UI is available at:

```text
http://localhost:5000/api-docs
```

Main endpoint groups:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET|POST /api/v1/organizations`
- `GET|PATCH|DELETE /api/v1/organizations/:id`
- `POST /api/v1/organizations/:id/members`
- `DELETE /api/v1/organizations/:id/members/:userId`
- `GET|POST /api/v1/projects`
- `GET|PATCH|DELETE /api/v1/projects/:id`
- `POST /api/v1/projects/:id/members`
- `DELETE /api/v1/projects/:id/members/:userId`
- `GET|POST /api/v1/queues`
- `GET|PATCH|DELETE /api/v1/queues/:id`
- `POST /api/v1/queues/:id/pause`
- `POST /api/v1/queues/:id/resume`
- `GET /api/v1/queues/:id/statistics`
- `GET|POST /api/v1/retry-policies`
- `GET|PATCH|DELETE /api/v1/retry-policies/:id`
- `GET|POST /api/v1/jobs`
- `POST /api/v1/jobs/batch`
- `GET|PATCH|DELETE /api/v1/jobs/:id`
- `POST /api/v1/jobs/:id/cancel`
- `POST /api/v1/jobs/:id/transition`
- `GET|POST /api/v1/workers`
- `POST /api/v1/workers/claim`
- `POST /api/v1/workers/recover-abandoned`
- `POST /api/v1/workers/:id/heartbeat`
- `POST /api/v1/workers/:id/drain`
- `POST /api/v1/workers/:id/stop`
- `POST /api/v1/workers/jobs/:id/running`
- `POST /api/v1/workers/jobs/:id/complete`
- `POST /api/v1/workers/jobs/:id/fail`
- `GET /api/v1/dead-letter-jobs`
- `GET|DELETE /api/v1/dead-letter-jobs/:id`
- `POST /api/v1/dead-letter-jobs/:id/retry`
- `GET /api/v1/logs/job-logs`
- `GET /api/v1/logs/worker-logs`
- `GET /api/v1/logs/executions`
