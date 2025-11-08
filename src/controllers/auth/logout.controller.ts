import { Request, Response } from "express";
import { verifyRefreshToken } from "../../lib/jwt";
import { revokeRefreshJti } from "../../util/tokenUtils";
import { RefreshTokenSchema } from "../../schemas/auth/auth.schema";
export async function logoutController(req: Request, res: Response) {
  const parsed = RefreshTokenSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ success: false, message: "Invalid refresh token" });

  const { refreshToken } = parsed.data;
  if (!refreshToken)
    return res
      .status(400)
      .json({ success: false, message: "Missing refreshToken" });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const jti = payload.jti;
    await revokeRefreshJti(jti);
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    return res.json({ success: true, message: "Logged out" });
  }
}
