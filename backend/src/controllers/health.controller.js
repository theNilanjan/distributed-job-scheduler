import { sequelize } from '../models/index.js';

export async function health(_req, res, next) {
  try {
    await sequelize.query('SELECT 1');
    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
        uptimeSeconds: Math.round(process.uptime())
      }
    });
  } catch (error) {
    next(error);
  }
}
