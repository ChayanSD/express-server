import { Request, Response } from "express";
import { SignupSchema } from "../../schemas/auth/auth.schema";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/db";
import { signAccessToken, signRefreshToken } from "../../lib/jwt";
import { storeRefreshJti } from "../../util/tokenUtils";
import redis from "../../lib/redis";
import { randomInt } from "crypto";
import transport from "../../lib/nodemailer";

export async function signupController(
  req: Request,
  res: Response
): Promise<Response> {
  const parseResult = SignupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      errors: parseResult.error.flatten(),
    });
  }
  const { companyName, email, password, profileImageUrl } = parseResult.data;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        companyName,
        email,
        password: hashedPassword,
        profileImageUrl,
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        profileImageUrl: true,
        isVerified: true,
        role: true,
      },
    });

    // Send verification email
    const otp = randomInt(1000, 9999).toString();
    await redis.set(`verify:${email}`, otp, { EX: 240 }); // 4 mins
    await transport.sendMail({
      to: user.email,
      text: `Your verification code is ${otp}`,
      subject: "Verify your email",
    });

    //Set the session
    // req.session.userId = user.id;
    // req.session.userRole = user.role;

    //Token strategy
    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
    });
    const {
      token: refreshToken,
      jti,
      expiresIn,
    } = signRefreshToken({ sub: user.id });

    // Store refresh jti in Redis with TTL
    await storeRefreshJti(jti, user.id, expiresIn);

    return res.status(201).json({
      success: true,
      user,
      tokens: { accessToken, refreshToken, expiresIn },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      errors: ["Internal server error"],
    });
  }
}
