import jwt from "jsonwebtoken";
import config from "../config/config";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.accessTokenExpiry,
  } as any);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwtAccessSecret) as any;
}

export function signRefreshToken(payload: object) {
  const jti = crypto.randomUUID();
  const refreshPayload = { ...payload, jti };
  const token = jwt.sign(refreshPayload, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenExpiry,
  });
  return { token, jti, expiresIn: config.refreshTokenExpiry };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwtRefreshSecret) as any;
}
