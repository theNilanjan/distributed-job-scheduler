import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const json = { type: 'application/json' };
const ok = { description: 'Successful response' };
const created = { description: 'Created' };
const unauthorized = { description: 'Authentication failed or missing token' };

function secured(methods) {
  return Object.fromEntries(Object.entries(methods).map(([method, operation]) => [
    method,
    {
      security: [{ bearerAuth: [] }],
      responses: { 200: ok, 201: created, 400: { description: 'Validation failed' }, 401: unauthorized, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
      ...operation
    }
  ]));
}

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Distributed Job Scheduler API',
      version: '1.0.0',
      description: 'Production-inspired job scheduling platform API.'
    },
    servers: [{ url: env.API_BASE_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            details: { type: 'object' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/v1/health': { get: { tags: ['Health'], summary: 'Check API and database health', security: [], responses: { 200: ok, 500: { description: 'Unhealthy' } } } },
      '/api/v1/auth/register': { post: { tags: ['Auth'], summary: 'Register a user', security: [], requestBody: { required: true, content: { [json.type]: { schema: { type: 'object' } } } }, responses: { 201: created, 400: { description: 'Validation failed' } } } },
      '/api/v1/auth/login': { post: { tags: ['Auth'], summary: 'Login with email and password', security: [], requestBody: { required: true, content: { [json.type]: { schema: { type: 'object' } } } }, responses: { 200: ok, 401: unauthorized } } },
      '/api/v1/auth/refresh': { post: { tags: ['Auth'], summary: 'Rotate refresh token and issue new access token', security: [], responses: { 200: ok, 401: unauthorized } } },
      '/api/v1/auth/logout': secured({ post: { tags: ['Auth'], summary: 'Logout and revoke refresh tokens' } }),
      '/api/v1/auth/me': secured({ get: { tags: ['Auth'], summary: 'Get current authenticated user' } }),
      '/api/v1/dashboard/summary': secured({ get: { tags: ['Dashboard'], summary: 'Get dashboard summary metrics' } }),

      '/api/v1/organizations': secured({ get: { tags: ['Organizations'], summary: 'List organizations with pagination, search, and sorting' }, post: { tags: ['Organizations'], summary: 'Create organization' } }),
      '/api/v1/organizations/{id}': secured({ get: { tags: ['Organizations'], summary: 'Get organization by id' }, patch: { tags: ['Organizations'], summary: 'Update organization' }, delete: { tags: ['Organizations'], summary: 'Delete organization' } }),
      '/api/v1/organizations/{id}/members': secured({ post: { tags: ['Organizations'], summary: 'Add or update organization member' } }),
      '/api/v1/organizations/{id}/members/{userId}': secured({ delete: { tags: ['Organizations'], summary: 'Remove organization member' } }),

      '/api/v1/projects': secured({ get: { tags: ['Projects'], summary: 'List projects with filters' }, post: { tags: ['Projects'], summary: 'Create project' } }),
      '/api/v1/projects/{id}': secured({ get: { tags: ['Projects'], summary: 'Get project by id' }, patch: { tags: ['Projects'], summary: 'Update project' }, delete: { tags: ['Projects'], summary: 'Delete project' } }),
      '/api/v1/projects/{id}/members': secured({ post: { tags: ['Projects'], summary: 'Add or update project member' } }),
      '/api/v1/projects/{id}/members/{userId}': secured({ delete: { tags: ['Projects'], summary: 'Remove project member' } }),

      '/api/v1/queues': secured({ get: { tags: ['Queues'], summary: 'List queues with filters and search' }, post: { tags: ['Queues'], summary: 'Create queue' } }),
      '/api/v1/queues/{id}': secured({ get: { tags: ['Queues'], summary: 'Get queue by id' }, patch: { tags: ['Queues'], summary: 'Update queue configuration' }, delete: { tags: ['Queues'], summary: 'Delete queue' } }),
      '/api/v1/queues/{id}/pause': secured({ post: { tags: ['Queues'], summary: 'Pause queue' } }),
      '/api/v1/queues/{id}/resume': secured({ post: { tags: ['Queues'], summary: 'Resume queue' } }),
      '/api/v1/queues/{id}/statistics': secured({ get: { tags: ['Queues'], summary: 'Get queue statistics' } }),

      '/api/v1/retry-policies': secured({ get: { tags: ['Retry Policies'], summary: 'List retry policies' }, post: { tags: ['Retry Policies'], summary: 'Create retry policy' } }),
      '/api/v1/retry-policies/{id}': secured({ get: { tags: ['Retry Policies'], summary: 'Get retry policy' }, patch: { tags: ['Retry Policies'], summary: 'Update retry policy' }, delete: { tags: ['Retry Policies'], summary: 'Delete retry policy' } }),

      '/api/v1/jobs': secured({ get: { tags: ['Jobs'], summary: 'Search, filter, sort, and paginate jobs' }, post: { tags: ['Jobs'], summary: 'Create immediate, delayed, scheduled, or cron job' } }),
      '/api/v1/jobs/batch': secured({ post: { tags: ['Jobs'], summary: 'Create batch jobs' } }),
      '/api/v1/jobs/{id}': secured({ get: { tags: ['Jobs'], summary: 'Get job details' }, patch: { tags: ['Jobs'], summary: 'Update pending job' }, delete: { tags: ['Jobs'], summary: 'Delete pending job' } }),
      '/api/v1/jobs/{id}/cancel': secured({ post: { tags: ['Jobs'], summary: 'Cancel job' } }),
      '/api/v1/jobs/{id}/transition': secured({ post: { tags: ['Jobs'], summary: 'Transition job lifecycle state' } }),

      '/api/v1/workers': secured({ get: { tags: ['Workers'], summary: 'List workers' }, post: { tags: ['Workers'], summary: 'Register worker' } }),
      '/api/v1/workers/claim': secured({ post: { tags: ['Workers'], summary: 'Atomically claim jobs using MySQL row locks' } }),
      '/api/v1/workers/recover-abandoned': secured({ post: { tags: ['Workers'], summary: 'Recover jobs from stale workers' } }),
      '/api/v1/workers/{id}/heartbeat': secured({ post: { tags: ['Workers'], summary: 'Send worker heartbeat' } }),
      '/api/v1/workers/{id}/drain': secured({ post: { tags: ['Workers'], summary: 'Start graceful worker drain' } }),
      '/api/v1/workers/{id}/stop': secured({ post: { tags: ['Workers'], summary: 'Mark worker stopped' } }),
      '/api/v1/workers/jobs/{id}/running': secured({ post: { tags: ['Workers'], summary: 'Mark claimed job running' } }),
      '/api/v1/workers/jobs/{id}/complete': secured({ post: { tags: ['Workers'], summary: 'Complete claimed job' } }),
      '/api/v1/workers/jobs/{id}/fail': secured({ post: { tags: ['Workers'], summary: 'Fail claimed job and trigger retry or DLQ' } }),

      '/api/v1/dead-letter-jobs': secured({ get: { tags: ['Dead Letter Queue'], summary: 'List dead-letter jobs' } }),
      '/api/v1/dead-letter-jobs/{id}': secured({ get: { tags: ['Dead Letter Queue'], summary: 'View dead-letter failure details' }, delete: { tags: ['Dead Letter Queue'], summary: 'Delete dead-letter entry' } }),
      '/api/v1/dead-letter-jobs/{id}/retry': secured({ post: { tags: ['Dead Letter Queue'], summary: 'Replay dead-letter job' } }),

      '/api/v1/logs/job-logs': secured({ get: { tags: ['Logs'], summary: 'List job execution logs' } }),
      '/api/v1/logs/worker-logs': secured({ get: { tags: ['Logs'], summary: 'List worker logs' } }),
      '/api/v1/logs/executions': secured({ get: { tags: ['Logs'], summary: 'List job execution history' } })
    }
  },
  apis: ['./src/routes/*.js']
});
