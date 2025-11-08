import { Request, Response } from "express";
import { SetNewPasswordSchema } from "../../schemas/auth/auth.schema";
import { prisma } from "../../lib/db";
import redis from "../../lib/redis";
import bcrypt from "bcryptjs";

export async function setNewPasswordController(req: Request, res: Response) {
  const parsed = SetNewPasswordSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ success: false, errors: parsed.error.flatten() });

  const { email, otp, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const storedOtp = await redis.get(`reset:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });
    await redis.del(`reset:${email}`);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
