import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
    role?: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ success: false, message: "No token" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ success: false, message: "Malformed token" });

  try {
    const payload = verifyAccessToken(parts[1]);
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid/expired token" });
  }
}
