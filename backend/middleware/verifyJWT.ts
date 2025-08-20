import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

export const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("Missing ACCESS_TOKEN_SECRET");

    const decoded = jwt.verify(token, secret) as JwtPayload;


    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    

    next();
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
};

