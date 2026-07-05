import { models, sequelize } from '../models/index.js';
import { env } from '../config/env.js';
import { badRequest, unauthorized } from '../utils/httpError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { addDuration, sha256 } from '../utils/crypto.js';

function tokenPayload(user, roles) {
  return {
    sub: user.id,
    email: user.email,
    roles
  };
}

export async function registerUser({ name, email, password }) {
  return sequelize.transaction(async (transaction) => {
    const existing = await models.User.findOne({ where: { email }, transaction });
    if (existing) throw badRequest('Email is already registered');

    const user = await models.User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      status: 'ACTIVE'
    }, { transaction });

    const role = await models.Role.findOne({ where: { name: 'VIEWER' }, transaction });
    if (role) {
      await models.UserRole.create({
        userId: user.id,
        roleId: role.id
      }, { transaction });
    }

    const roles = role ? [role.name] : [];
    const refreshToken = signRefreshToken(tokenPayload(user, roles));
    await models.RefreshToken.create({
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: addDuration(new Date(), env.JWT_REFRESH_EXPIRES_IN)
    }, { transaction });

    return {
      user: { id: user.id, name: user.name, email: user.email, roles },
      accessToken: signAccessToken(tokenPayload(user, roles)),
      refreshToken
    };
  });
}

export async function loginUser({ email, password }, context = {}) {
  const user = await models.User.findOne({
    where: { email },
    include: [{
      model: models.UserRole,
      as: 'userRoles',
      include: [{ model: models.Role, as: 'role' }]
    }]
  });

  if (!user || user.status !== 'ACTIVE') throw unauthorized('Invalid email or password');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw unauthorized('Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save();

  const roles = user.userRoles ? user.userRoles.map((ur) => ur.role.name) : [];
  const refreshToken = signRefreshToken(tokenPayload(user, roles));
  await models.RefreshToken.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: addDuration(new Date(), env.JWT_REFRESH_EXPIRES_IN),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, roles },
    accessToken: signAccessToken(tokenPayload(user, roles)),
    refreshToken
  };
}

export async function refreshTokens(refreshToken, context = {}) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = sha256(refreshToken);

  return sequelize.transaction(async (transaction) => {
    const stored = await models.RefreshToken.findOne({
      where: { tokenHash },
      include: [{
        model: models.User,
        as: 'user',
        include: [{
          model: models.UserRole,
          as: 'userRoles',
          include: [{ model: models.Role, as: 'role' }]
        }]
      }],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
      throw unauthorized('Invalid refresh token');
    }

    if (String(stored.userId) !== String(payload.sub) || stored.user.status !== 'ACTIVE') {
      throw unauthorized('Invalid refresh token');
    }

    const roles = stored.user.userRoles ? stored.user.userRoles.map((ur) => ur.role.name) : [];
    const nextRefreshToken = signRefreshToken(tokenPayload(stored.user, roles));
    const nextHash = sha256(nextRefreshToken);
    stored.revokedAt = new Date();
    stored.replacedByTokenHash = nextHash;
    await stored.save({ transaction });

    await models.RefreshToken.create({
      userId: stored.userId,
      tokenHash: nextHash,
      expiresAt: addDuration(new Date(), env.JWT_REFRESH_EXPIRES_IN),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    }, { transaction });

    return {
      user: { id: stored.user.id, name: stored.user.name, email: stored.user.email, roles },
      accessToken: signAccessToken(tokenPayload(stored.user, roles)),
      refreshToken: nextRefreshToken
    };
  });
}

export async function logoutUser(userId, refreshToken) {
  const where = { userId, revokedAt: null };
  if (refreshToken) where.tokenHash = sha256(refreshToken);
  await models.RefreshToken.update({ revokedAt: new Date() }, { where });
  return { revoked: true };
}
