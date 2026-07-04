import { loginUser, logoutUser, refreshTokens, registerUser } from '../services/auth.service.js';
import { created, success } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    created(res, result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    success(res, result);
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  success(res, req.user);
}

export async function refresh(req, res, next) {
  try {
    const result = await refreshTokens(req.body.refreshToken, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const result = await logoutUser(req.user.id, req.body?.refreshToken);
    success(res, result);
  } catch (error) {
    next(error);
  }
}
