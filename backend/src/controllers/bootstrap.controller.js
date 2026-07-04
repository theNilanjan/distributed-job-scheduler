import { models } from '../models/index.js';

export async function dashboardSummary(_req, res, next) {
  try {
    const [organizations, projects, queues, jobs, workers, deadLetterJobs] = await Promise.all([
      models.Organization.count(),
      models.Project.count(),
      models.JobQueue.count(),
      models.Job.count(),
      models.Worker.count(),
      models.DeadLetterJob.count()
    ]);

    res.json({
      success: true,
      data: { organizations, projects, queues, jobs, workers, deadLetterJobs }
    });
  } catch (error) {
    next(error);
  }
}
