# Architecture Diagram

```mermaid
flowchart LR
  Browser[React Dashboard] -->|JWT REST| API[Express API]
  Browser <-->|Socket.IO| API
  API --> Services[Service Layer]
  Services --> MySQL[(MySQL 8)]
  Worker[Worker Runtime] -->|poll and claim| MySQL
  Worker -->|execution logs and heartbeats| MySQL
  API -->|live events| Browser
```

# Modular Backend

```mermaid
flowchart TB
  Auth --> Users
  Organizations --> Projects
  Projects --> Queues
  Queues --> Jobs
  Jobs --> Executions
  Jobs --> Retry
  Retry --> DLQ
  Workers --> Jobs
  Logs --> Dashboard
```

# ER Diagram

```mermaid
erDiagram
  users ||--o{ user_roles : has
  roles ||--o{ user_roles : grants
  users ||--o{ refresh_tokens : owns
  organizations ||--o{ organization_members : has
  users ||--o{ organization_members : joins
  organizations ||--o{ projects : owns
  projects ||--o{ project_members : has
  users ||--o{ project_members : joins
  projects ||--o{ job_queues : owns
  retry_policies ||--o{ job_queues : configures
  job_queues ||--o{ jobs : contains
  jobs ||--o{ job_executions : records
  workers ||--o{ job_executions : runs
  workers ||--o{ worker_heartbeats : sends
  workers ||--o{ worker_logs : writes
  jobs ||--o{ job_logs : writes
  jobs ||--o{ retry_history : retries
  jobs ||--o| dead_letter_jobs : fails_into
  jobs ||--o{ workflow_dependencies : parent
  jobs ||--o{ workflow_dependencies : child
```

# Atomic Claim Sequence

```mermaid
sequenceDiagram
  participant W1 as Worker A
  participant W2 as Worker B
  participant DB as MySQL
  W1->>DB: BEGIN; lock queue row FOR UPDATE
  W1->>DB: SELECT eligible jobs FOR UPDATE SKIP LOCKED
  W2->>DB: SELECT eligible jobs FOR UPDATE SKIP LOCKED
  DB-->>W2: skips rows locked by Worker A
  W1->>DB: UPDATE jobs SET status=CLAIMED, worker_id=A
  W1->>DB: INSERT job_executions
  W1->>DB: COMMIT
```

# Deployment Diagram

```mermaid
flowchart LR
  User[User Browser] --> Frontend[Vite/React container]
  Frontend --> Backend[Node/Express API container]
  Backend --> Database[(MySQL 8)]
  Worker[Node Worker container] --> Database
  Backend <-->|Socket.IO| Frontend
```
