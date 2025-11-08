import { Request , Response} from "express";
import { LoginSchema } from "../../schemas/auth/auth.schema";
import { prisma } from "../../lib/db";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../../lib/jwt";
import { storeRefreshJti, revokeAllUserRefreshTokens } from "../../util/tokenUtils";
export async function loginController(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, errors: parsed.error.flatten() });

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Revoke all previous refresh tokens for this user
    await revokeAllUserRefreshTokens(user.id);

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const { token: refreshToken, jti, expiresIn } = signRefreshToken({ sub: user.id });

    await storeRefreshJti(jti, user.id, expiresIn);

    return res.json({
      success: true,
      user: { id: user.id, email: user.email, companyName: user.companyName, role: user.role },
      tokens: { accessToken, refreshToken, expiresIn },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}