import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export const hashPassword = (password) => bcrypt.hash(password, env.BCRYPT_ROUNDS);
export const verifyPassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);
