import { Request, Response } from "express";
import { prisma } from "../../lib/db";
import { randomInt } from "crypto";
import redis from "../../lib/redis";
import transport from "../../lib/nodemailer";
import { z } from "zod";

const ForgetPasswordSchema = z.object({
  email: z.email(),
});

export async function forgetPasswordController(req: Request, res: Response) {
  const parsed = ForgetPasswordSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ success: false, errors: parsed.error.flatten() });

  const { email } = parsed.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const otp = randomInt(1000, 9999).toString();
    await redis.set(`reset:${email}`, otp, { EX: 120 });
    await transport.sendMail({
      to: user.email,
      text: `Your password reset code is ${otp}`,
      subject: "Reset your password",
    });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
