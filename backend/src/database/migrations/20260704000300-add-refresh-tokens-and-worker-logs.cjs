'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      token_hash: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      revoked_at: { type: Sequelize.DATE },
      replaced_by_token_hash: { type: Sequelize.STRING(255) },
      ip_address: { type: Sequelize.STRING(64) },
      user_agent: { type: Sequelize.STRING(512) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('refresh_tokens', ['user_id', 'revoked_at', 'expires_at'], { name: 'idx_refresh_tokens_user_validity' });

    await queryInterface.createTable('worker_logs', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      worker_id: { type: Sequelize.BIGINT.UNSIGNED, references: { model: 'workers', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      level: { type: Sequelize.ENUM('DEBUG', 'INFO', 'WARN', 'ERROR'), allowNull: false, defaultValue: 'INFO' },
      message: { type: Sequelize.TEXT, allowNull: false },
      metadata: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('worker_logs', ['worker_id', 'created_at'], { name: 'idx_worker_logs_worker_created' });
    await queryInterface.addIndex('worker_logs', ['level', 'created_at'], { name: 'idx_worker_logs_level_created' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('worker_logs');
    await queryInterface.dropTable('refresh_tokens');
  }
};
