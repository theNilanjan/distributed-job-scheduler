'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'SUPER_ADMIN', description: 'Full platform administrator' },
      { id: 2, name: 'ORG_ADMIN', description: 'Organization administrator' },
      { id: 3, name: 'PROJECT_ADMIN', description: 'Project administrator' },
      { id: 4, name: 'DEVELOPER', description: 'Can create and operate jobs' },
      { id: 5, name: 'VIEWER', description: 'Read-only access' },
      { id: 6, name: 'WORKER', description: 'Worker runtime identity' }
    ]);

    await queryInterface.bulkInsert('users', [{
      id: 1,
      name: 'Platform Admin',
      email: 'admin@jobscheduler.local',
      password_hash: await bcrypt.hash('Admin@12345', 12),
      status: 'ACTIVE',
      created_at: now,
      updated_at: now
    }]);

    await queryInterface.bulkInsert('user_roles', [{ id: 1, user_id: 1, role_id: 1 }]);

    await queryInterface.bulkInsert('organizations', [{
      id: 1,
      name: 'Acme University Labs',
      slug: 'acme-university-labs',
      description: 'Sample organization for the job scheduling demo.',
      created_at: now,
      updated_at: now
    }]);

    await queryInterface.bulkInsert('organization_members', [{
      id: 1,
      organization_id: 1,
      user_id: 1,
      role: 'ORG_ADMIN',
      created_at: now,
      updated_at: now
    }]);

    await queryInterface.bulkInsert('projects', [{
      id: 1,
      organization_id: 1,
      name: 'Data Processing Platform',
      key: 'DPP',
      description: 'Sample project containing queues and jobs.',
      status: 'ACTIVE',
      created_at: now,
      updated_at: now
    }]);

    await queryInterface.bulkInsert('project_members', [{
      id: 1,
      project_id: 1,
      user_id: 1,
      role: 'PROJECT_ADMIN',
      created_at: now,
      updated_at: now
    }]);

    await queryInterface.bulkInsert('retry_policies', [
      { id: 1, name: 'Fixed 30s x3', strategy: 'FIXED', max_attempts: 3, base_delay_seconds: 30, max_delay_seconds: 300, jitter_enabled: true, created_at: now, updated_at: now },
      { id: 2, name: 'Linear 60s x5', strategy: 'LINEAR', max_attempts: 5, base_delay_seconds: 60, max_delay_seconds: 900, jitter_enabled: true, created_at: now, updated_at: now },
      { id: 3, name: 'Exponential 15s x6', strategy: 'EXPONENTIAL', max_attempts: 6, base_delay_seconds: 15, max_delay_seconds: 1800, jitter_enabled: true, created_at: now, updated_at: now }
    ]);

    await queryInterface.bulkInsert('job_queues', [
      { id: 1, project_id: 1, retry_policy_id: 3, name: 'High Priority ETL', slug: 'high-priority-etl', status: 'ACTIVE', priority: 100, concurrency_limit: 5, rate_limit_per_minute: 120, shard_key: 'etl-a', created_at: now, updated_at: now },
      { id: 2, project_id: 1, retry_policy_id: 1, name: 'Reports', slug: 'reports', status: 'PAUSED', priority: 20, concurrency_limit: 2, rate_limit_per_minute: 30, shard_key: 'reports-a', created_at: now, updated_at: now }
    ]);

    await queryInterface.bulkInsert('jobs', [{
      id: 1,
      queue_id: 1,
      batch_id: null,
      idempotency_key: 'seed-job-1',
      type: 'IMMEDIATE',
      status: 'QUEUED',
      name: 'Seed ETL Import',
      payload: JSON.stringify({ dataset: 'students', operation: 'import' }),
      priority: 50,
      attempts: 0,
      max_attempts: 3,
      run_at: now,
      execution_timeout_seconds: 300,
      created_at: now,
      updated_at: now
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('jobs', null, {});
    await queryInterface.bulkDelete('job_queues', null, {});
    await queryInterface.bulkDelete('retry_policies', null, {});
    await queryInterface.bulkDelete('project_members', null, {});
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('organization_members', null, {});
    await queryInterface.bulkDelete('organizations', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
