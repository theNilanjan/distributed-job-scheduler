# Design Decisions

## Architecture

The project uses a modular monolith. It keeps deployment simple for a university project while preserving clear service boundaries for auth, organizations, projects, queues, jobs, workers, retries, logs, and dead-letter handling.

## Database Design

MySQL is the source of truth. The schema is normalized around organizations, projects, queues, jobs, workers, execution history, retry history, logs, and dead-letter jobs. Composite indexes are added for queue polling, job status filtering, worker lookup, and retry scheduling.

## Concurrency Strategy

Atomic claiming uses MySQL transactions. The worker locks a queue row to serialize queue-level concurrency checks, then selects eligible jobs with `FOR UPDATE SKIP LOCKED`. This prevents duplicate execution when multiple workers poll at the same time.

## Worker Design

Workers register themselves, send heartbeats, claim jobs, run them concurrently, and support graceful shutdown. Stale workers are detected by heartbeat timeout and their claimed/running jobs are recovered back to `QUEUED`.

## Retry Strategy

Retry policies support fixed delay, linear backoff, and exponential backoff with optional jitter. Failed jobs write retry history and move to `RETRY_PENDING` until their next run time.

## Dead Letter Queue

When retry attempts are exhausted, jobs move to `DEAD_LETTER` and a dead-letter record stores failure reason, stack trace, payload snapshot, attempts, and timestamps. Operators can replay or delete DLQ entries.

## Frontend

The dashboard uses React Query for caching and refetching, Axios for authenticated REST calls, Socket.IO for live invalidation, and Recharts for operational charts. Polling intervals are used where they improve reliability.

## Trade-offs

This design avoids Kafka/RabbitMQ to keep setup simple and reproducible. The database-backed queue is easier to evaluate and demonstrates transactional correctness. In larger production systems, the worker queue could be moved to a dedicated broker.

## Scalability

The design supports multiple API instances and multiple worker processes. Queue sharding metadata, rate limits, distributed locks, and indexed status queries provide clear extension points.
