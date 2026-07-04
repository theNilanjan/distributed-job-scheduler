import { deadLetterApi, jobsApi, organizationsApi, projectsApi, queuesApi, retryPoliciesApi, workersApi, logsApi } from './resourceApi';

export const dashboardApi = {
  summary: async () => {
    const [organizations, projects, queues, jobs, workers, deadLetters, policies, executions] = await Promise.all([
      organizationsApi.list({ limit: 100 }),
      projectsApi.list({ limit: 100 }),
      queuesApi.list({ limit: 100 }),
      jobsApi.list({ limit: 100 }),
      workersApi.list({ limit: 100 }),
      deadLetterApi.list({ limit: 100 }),
      retryPoliciesApi.list({ limit: 100 }),
      logsApi.executions({ limit: 100 })
    ]);

    const jobRows = jobs.data || [];
    const executionRows = executions.data || [];
    const byStatus = jobRows.reduce((acc, job) => ({ ...acc, [job.status]: (acc[job.status] || 0) + 1 }), {});
    const completed = byStatus.COMPLETED || 0;
    const failed = (byStatus.FAILED || 0) + (byStatus.DEAD_LETTER || 0);
    const decided = completed + failed;
    const durations = executionRows.map((row) => row.durationMs).filter((value) => typeof value === 'number');
    const averageExecutionTime = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0;

    return {
      organizations: organizations.meta?.total || organizations.data?.length || 0,
      projects: projects.meta?.total || projects.data?.length || 0,
      queues: queues.meta?.total || queues.data?.length || 0,
      activeWorkers: (workers.data || []).filter((worker) => worker.status === 'ONLINE').length,
      runningJobs: byStatus.RUNNING || 0,
      scheduledJobs: (byStatus.SCHEDULED || 0) + (byStatus.RETRY_PENDING || 0),
      completedJobs: completed,
      failedJobs: failed,
      deadLetterJobs: deadLetters.meta?.total || deadLetters.data?.length || 0,
      retryPolicies: policies.meta?.total || policies.data?.length || 0,
      successRate: decided ? Math.round((completed / decided) * 100) : 100,
      averageExecutionTime,
      jobsByStatus: byStatus,
      queueRows: queues.data || [],
      workerRows: workers.data || [],
      jobRows
    };
  }
};
