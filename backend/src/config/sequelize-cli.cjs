require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'jobscheduler',
  password: process.env.DB_PASSWORD || 'jobscheduler_password',
  database: process.env.DB_NAME || 'job_scheduler',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  timezone: '+00:00',
  migrationStorageTableName: 'sequelize_meta',
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_seed_meta'
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME || 'job_scheduler_test' },
  production: {
    ...base,
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined
    }
  }
};
