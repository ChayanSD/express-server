import { Request, Response } from "express";
import { VerifyOtpSchema } from "../../schemas/auth/auth.schema";
import { prisma } from "../../lib/db";
import redis from "../../lib/redis";

export async function verifyOtpController(req: Request, res: Response) {
  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ success: false, errors: parsed.error.flatten() });

  const { otp, email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const storedOtp = await redis.get(`verify:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    await redis.del(`verify:${email}`);

    return res.status(200).json({
      success: true,
      message: "Verification successful",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
