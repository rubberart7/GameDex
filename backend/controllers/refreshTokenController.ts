import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";
import { generateAccessToken } from "../libs/utils";

dotenv.config();
const prisma = new PrismaClient();

export const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.status(401).json({ message: "No refresh token cookie." });
    return;
  }

  const refreshToken = cookies.jwt;

  try {
    // Check if token exists in DB (not revoked or expired)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    // Check expiration
    if (storedToken.expiresAt < new Date()) {
        // with prisma .expiresAt is converted into a javascript data object, so if the current date is passed that means the token has expired
      res.status(403).json({ message: "Refresh token expired" });
      return;
    }

    const secret = process.env.REFRESH_TOKEN_SECRET!;
    const decoded = jwt.verify(refreshToken, secret) as JwtPayload;

    // Make sure the token actually belongs to the user
    if (decoded.userId !== storedToken.userId || decoded.email !== storedToken.user.email) {
      res.status(403).json({ message: "Token does not match user" });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(storedToken.userId, storedToken.user.email, String(process.env.ACCESS_TOKEN_SECRET));

    res.json({ accessToken: newAccessToken });
    return;
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
    return;
  }
};
