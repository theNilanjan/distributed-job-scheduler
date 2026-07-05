'use strict';

const id = { type: 'BIGINT UNSIGNED', autoIncrement: true, primaryKey: true };
const fk = { type: 'BIGINT UNSIGNED', allowNull: false };
const nullableFk = { type: 'BIGINT UNSIGNED' };
const timestamps = {
  created_at: { allowNull: false, type: 'DATETIME' },
  updated_at: { allowNull: false, type: 'DATETIME' }
};

async function addIndex(queryInterface, table, fields, options = {}) {
  await queryInterface.addIndex(table, fields, options);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop user_roles table if it exists to avoid migration conflicts
    const tableExists = await queryInterface.tableExists('user_roles');
    if (tableExists) {
      await queryInterface.dropTable('user_roles');
    }

    await queryInterface.createTable('users', {
      id,
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(190), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      status: { type: Sequelize.ENUM('ACTIVE', 'INVITED', 'SUSPENDED'), allowNull: false, defaultValue: 'ACTIVE' },
      last_login_at: { type: Sequelize.DATE },
      ...timestamps
    });

    await queryInterface.createTable('roles', {
      id,
      name: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      description: { type: Sequelize.STRING(255) }
    });

    await queryInterface.createTable('user_roles', {
      id,
      user_id: { ...fk, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      role_id: { ...fk, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    });
    await addIndex(queryInterface, 'user_roles', ['user_id', 'role_id'], { unique: true, name: 'ux_user_roles_user_role' });
    await addIndex(queryInterface, 'user_roles', ['role_id'], { name: 'role_id' });

    await queryInterface.createTable('organizations', {
      id,
      name: { type: Sequelize.STRING(140), allowNull: false },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
      ...timestamps
    });

    await queryInterface.createTable('organization_members', {
      id,
      organization_id: { ...fk, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      user_id: { ...fk, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      role: { type: Sequelize.ENUM('ORG_ADMIN', 'MEMBER', 'VIEWER'), allowNull: false, defaultValue: 'MEMBER' },
      ...timestamps
    });
    await addIndex(queryInterface, 'organization_members', ['organization_id', 'user_id'], { unique: true, name: 'ux_org_members_org_user' });

    await queryInterface.createTable('projects', {
      id,
      organization_id: { ...fk, references: { model: 'organizations', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      name: { type: Sequelize.STRING(140), allowNull: false },
      key: { type: Sequelize.STRING(40), allowNull: false },
      description: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('ACTIVE', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' },
      ...timestamps
    });
    await addIndex(queryInterface, 'projects', ['organization_id', 'key'], { unique: true, name: 'ux_projects_org_key' });

    await queryInterface.createTable('project_members', {
      id,
      project_id: { ...fk, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      user_id: { ...fk, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      role: { type: Sequelize.ENUM('PROJECT_ADMIN', 'DEVELOPER', 'VIEWER'), allowNull: false, defaultValue: 'DEVELOPER' },
      ...timestamps
    });
    await addIndex(queryInterface, 'project_members', ['project_id', 'user_id'], { unique: true, name: 'ux_project_members_project_user' });

    await queryInterface.createTable('retry_policies', {
      id,
      name: { type: Sequelize.STRING(120), allowNull: false },
      strategy: { type: Sequelize.ENUM('FIXED', 'LINEAR', 'EXPONENTIAL'), allowNull: false },
      max_attempts: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3 },
      base_delay_seconds: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 30 },
      max_delay_seconds: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3600 },
      jitter_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps
    });
    await addIndex(queryInterface, 'retry_policies', ['strategy']);

    await queryInterface.createTable('job_queues', {
      id,
      project_id: { ...fk, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      retry_policy_id: { ...nullableFk, references: { model: 'retry_policies', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      name: { type: Sequelize.STRING(140), allowNull: false },
      slug: { type: Sequelize.STRING(160), allowNull: false },
      status: { type: Sequelize.ENUM('ACTIVE', 'PAUSED', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' },
      priority: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      concurrency_limit: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 5 },
      rate_limit_per_minute: { type: Sequelize.INTEGER.UNSIGNED },
      shard_key: { type: Sequelize.STRING(80) },
      ...timestamps
    });
    await addIndex(queryInterface, 'job_queues', ['project_id', 'slug'], { unique: true, name: 'ux_queues_project_slug' });
    await addIndex(queryInterface, 'job_queues', ['status', 'priority'], { name: 'idx_queues_status_priority' });

    await queryInterface.createTable('workers', {
      id,
      name: { type: Sequelize.STRING(140), allowNull: false },
      hostname: { type: Sequelize.STRING(190), allowNull: false },
      status: { type: Sequelize.ENUM('ONLINE', 'DRAINING', 'OFFLINE', 'STALE'), allowNull: false, defaultValue: 'ONLINE' },
      max_concurrency: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 5 },
      current_load: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      last_heartbeat_at: { type: Sequelize.DATE },
      started_at: { type: Sequelize.DATE, allowNull: false },
      stopped_at: { type: Sequelize.DATE },
      ...timestamps
    });
    await addIndex(queryInterface, 'workers', ['status', 'last_heartbeat_at'], { name: 'idx_workers_health' });

    await queryInterface.createTable('jobs', {
      id,
      queue_id: { ...fk, references: { model: 'job_queues', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      batch_id: { type: Sequelize.STRING(80) },
      idempotency_key: { type: Sequelize.STRING(160) },
      type: { type: Sequelize.ENUM('IMMEDIATE', 'DELAYED', 'SCHEDULED', 'CRON', 'BATCH'), allowNull: false },
      status: { type: Sequelize.ENUM('QUEUED', 'SCHEDULED', 'CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRY_PENDING', 'DEAD_LETTER', 'CANCELLED'), allowNull: false },
      name: { type: Sequelize.STRING(180), allowNull: false },
      payload: { type: Sequelize.JSON, allowNull: false },
      priority: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      attempts: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      max_attempts: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3 },
      run_at: { type: Sequelize.DATE, allowNull: false },
      claimed_at: { type: Sequelize.DATE },
      started_at: { type: Sequelize.DATE },
      completed_at: { type: Sequelize.DATE },
      failed_at: { type: Sequelize.DATE },
      next_retry_at: { type: Sequelize.DATE },
      locked_by_worker_id: { ...nullableFk, references: { model: 'workers', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      last_error: { type: Sequelize.TEXT },
      execution_timeout_seconds: { type: Sequelize.INTEGER.UNSIGNED, defaultValue: 300 },
      ...timestamps
    });
    await addIndex(queryInterface, 'jobs', ['queue_id', 'idempotency_key'], { unique: true, name: 'ux_jobs_queue_idempotency' });
    await addIndex(queryInterface, 'jobs', ['queue_id', 'status', 'run_at', 'priority', 'created_at'], { name: 'idx_jobs_claiming' });
    await addIndex(queryInterface, 'jobs', ['status', 'next_retry_at'], { name: 'idx_jobs_retry_due' });
    await addIndex(queryInterface, 'jobs', ['batch_id', 'status'], { name: 'idx_jobs_batch_status' });
    await addIndex(queryInterface, 'jobs', ['locked_by_worker_id', 'status'], { name: 'idx_jobs_worker_status' });

    await queryInterface.createTable('scheduled_jobs', {
      id,
      queue_id: { ...fk, references: { model: 'job_queues', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      template_job_id: { ...nullableFk, references: { model: 'jobs', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      cron_expression: { type: Sequelize.STRING(120) },
      timezone: { type: Sequelize.STRING(80), allowNull: false, defaultValue: 'UTC' },
      next_run_at: { type: Sequelize.DATE, allowNull: false },
      last_run_at: { type: Sequelize.DATE },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...timestamps
    });
    await addIndex(queryInterface, 'scheduled_jobs', ['active', 'next_run_at'], { name: 'idx_scheduled_jobs_due' });

    await queryInterface.createTable('job_executions', {
      id,
      job_id: { ...fk, references: { model: 'jobs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      worker_id: { ...nullableFk, references: { model: 'workers', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      attempt_number: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      status: { type: Sequelize.ENUM('CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'), allowNull: false },
      started_at: { type: Sequelize.DATE },
      finished_at: { type: Sequelize.DATE },
      duration_ms: { type: Sequelize.INTEGER.UNSIGNED },
      result: { type: Sequelize.JSON },
      error_message: { type: Sequelize.TEXT },
      ...timestamps
    });
    await addIndex(queryInterface, 'job_executions', ['job_id', 'attempt_number'], { unique: true, name: 'ux_executions_job_attempt' });
    await addIndex(queryInterface, 'job_executions', ['worker_id', 'status'], { name: 'idx_executions_worker_status' });

    await queryInterface.createTable('retry_history', {
      id,
      job_id: { ...fk, references: { model: 'jobs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      attempt_number: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      strategy: { type: Sequelize.ENUM('FIXED', 'LINEAR', 'EXPONENTIAL'), allowNull: false },
      delay_seconds: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      scheduled_at: { type: Sequelize.DATE, allowNull: false },
      error_message: { type: Sequelize.TEXT },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await addIndex(queryInterface, 'retry_history', ['job_id', 'attempt_number'], { unique: true, name: 'ux_retry_job_attempt' });

    await queryInterface.createTable('worker_heartbeats', {
      id,
      worker_id: { ...fk, references: { model: 'workers', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      active_jobs: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      capacity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      metadata: { type: Sequelize.JSON },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await addIndex(queryInterface, 'worker_heartbeats', ['worker_id', 'created_at'], { name: 'idx_heartbeats_worker_created' });

    await queryInterface.createTable('job_logs', {
      id,
      job_id: { ...fk, references: { model: 'jobs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      execution_id: { ...nullableFk, references: { model: 'job_executions', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      level: { type: Sequelize.ENUM('DEBUG', 'INFO', 'WARN', 'ERROR'), allowNull: false, defaultValue: 'INFO' },
      message: { type: Sequelize.TEXT, allowNull: false },
      metadata: { type: Sequelize.JSON },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await addIndex(queryInterface, 'job_logs', ['job_id', 'created_at'], { name: 'idx_logs_job_created' });
    await addIndex(queryInterface, 'job_logs', ['level', 'created_at'], { name: 'idx_logs_level_created' });

    await queryInterface.createTable('dead_letter_jobs', {
      id,
      job_id: { ...fk, unique: true, references: { model: 'jobs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      queue_id: { ...fk, references: { model: 'job_queues', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      failure_reason: { type: Sequelize.TEXT, allowNull: false },
      stack_trace: { type: Sequelize.TEXT('long') },
      payload_snapshot: { type: Sequelize.JSON, allowNull: false },
      attempts: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      failed_at: { type: Sequelize.DATE, allowNull: false },
      replayed_at: { type: Sequelize.DATE },
      ai_summary: { type: Sequelize.TEXT },
      ...timestamps
    });
    await addIndex(queryInterface, 'dead_letter_jobs', ['queue_id', 'failed_at'], { name: 'idx_dlq_queue_failed' });

    await queryInterface.createTable('workflow_dependencies', {
      id,
      parent_job_id: { ...fk, references: { model: 'jobs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      child_job_id: { ...fk, references: { model: 'jobs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      dependency_type: { type: Sequelize.ENUM('SUCCESS', 'COMPLETION'), allowNull: false, defaultValue: 'SUCCESS' },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await addIndex(queryInterface, 'workflow_dependencies', ['parent_job_id', 'child_job_id'], { unique: true, name: 'ux_workflow_parent_child' });

    await queryInterface.createTable('distributed_locks', {
      name: { type: Sequelize.STRING(120), primaryKey: true },
      owner: { type: Sequelize.STRING(190), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      metadata: { type: Sequelize.JSON },
      ...timestamps
    });
    await addIndex(queryInterface, 'distributed_locks', ['expires_at'], { name: 'idx_locks_expires' });
  },

  async down(queryInterface) {
    const tables = [
      'distributed_locks',
      'workflow_dependencies',
      'dead_letter_jobs',
      'job_logs',
      'worker_heartbeats',
      'retry_history',
      'job_executions',
      'scheduled_jobs',
      'jobs',
      'workers',
      'job_queues',
      'retry_policies',
      'project_members',
      'projects',
      'organization_members',
      'organizations',
      'user_roles',
      'roles',
      'users'
    ];

    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  }
};
