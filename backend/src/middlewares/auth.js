import { models } from '../models/index.js';
import { unauthorized, forbidden } from '../utils/httpError.js';
import { verifyAccessToken } from '../utils/jwt.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw unauthorized();

    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token);
    const user = await models.User.findByPk(payload.sub, {
      include: [{ model: models.Role, as: 'roles', through: { attributes: [] } }]
    });

    if (!user || user.status !== 'ACTIVE') throw unauthorized('Invalid or inactive user');

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles ? user.roles.map((role) => role.name) : []
    };
    next();
  } catch (error) {
    next(error.statusCode ? error : unauthorized('Invalid or expired token'));
  }
}

export const authorize = (...allowedRoles) => (req, _res, next) => {
  const roles = req.user?.roles || [];
  if (!roles.some((role) => allowedRoles.includes(role))) {
    return next(forbidden());
  }
  return next();
};
