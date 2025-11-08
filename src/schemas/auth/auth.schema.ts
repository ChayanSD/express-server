import { z } from "zod";

export const SignupSchema = z.object({
  companyName: z.string().min(2, "companyName too short").max(100),
  email: z.email("invalid email"),
  password: z.string().min(4, "password must be 8+ chars"),
  profileImageUrl: z.url().optional(),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(4),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const VerifyOtpSchema = z.object({
  otp: z.string(),
  email : z.email()
});

export const SetNewPasswordSchema = z.object({
  email : z.email(),
  otp : z.string(),
  newPassword : z.string().min(8)
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
