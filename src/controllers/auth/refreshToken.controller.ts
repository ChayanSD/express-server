import { Request, Response } from "express";
import { verifyRefreshToken } from "../../lib/jwt";
import { signAccessToken, signRefreshToken } from "../../lib/jwt";
import { revokeRefreshJti, storeRefreshJti } from "../../util/tokenUtils";
import redis from "../../lib/redis";

import { RefreshTokenSchema } from "../../schemas/auth/auth.schema";

const REFRESH_KEY_PREFIX = "refresh:";

export async function refreshController(req: Request, res: Response) {
  // Expect { refreshToken }
  const parsed = RefreshTokenSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ success: false, message: "Invalid refresh token" });
  const { refreshToken } = parsed.data;
  if (!refreshToken)
    return res
      .status(400)
      .json({ success: false, message: "Invalid refresh token" });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const jti = payload.jti;
    const userId = payload.sub;

    // Check Redis to ensure jti is active and belongs to userId
    const storedUserId = await redis.get(REFRESH_KEY_PREFIX + jti);
    if (!storedUserId || storedUserId !== userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    // Rotation: revoke old jti and issue new tokens
    await revokeRefreshJti(jti);

    const accessToken = signAccessToken({ sub: userId, role: payload.role });
    const {
      token: newRefreshToken,
      jti: newJti,
      expiresIn,
    } = signRefreshToken({ sub: userId });

    await storeRefreshJti(newJti, userId, expiresIn);

    return res.json({
      success: true,
      tokens: { accessToken, refreshToken: newRefreshToken, expiresIn },
    });
  } catch (err: any) {
    console.error("Refresh error", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
}
