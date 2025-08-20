import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "../server";
import { generateAccessToken } from "../libs/utils";

dotenv.config();

export const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.status(401).json({ message: "No refresh token cookie." });
    return;
  }

  const refreshToken = cookies.jwt;

  try {
    // First verify the JWT signature
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      console.error("REFRESH_TOKEN_SECRET not configured");
      res.status(500).json({ message: "Server configuration error" });
      return;
    }

    const decoded = jwt.verify(refreshToken, secret) as JwtPayload;

    // Then check database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      try {
        await prisma.refreshToken.delete({
          where: { token: refreshToken },
        });
      } catch (cleanupError) {
        console.error("Error cleaning up expired token:", cleanupError);
        // Don't fail the request if cleanup fails
      }
      
      res.status(403).json({ message: "Refresh token expired" });
      return;
    }

    // Verify token data matches stored data
    if (decoded.userId !== storedToken.userId || decoded.email !== storedToken.user.email) {
      console.error("Token data mismatch for user:", storedToken.userId);
      res.status(403).json({ message: "Token does not match user" });
      return;
    }

    // Generate new access token
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      console.error("ACCESS_TOKEN_SECRET not configured");
      res.status(500).json({ message: "Server configuration error" });
      return;
    }

    const newAccessToken = generateAccessToken(
      storedToken.userId, 
      storedToken.user.email, 
      accessTokenSecret
    );

    res.json({ accessToken: newAccessToken });
    return;

  } catch (err) {
    // Handle different types of errors
    if (err instanceof jwt.JsonWebTokenError) {
      console.error("JWT verification failed:", err.message);
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    if (err instanceof jwt.TokenExpiredError) {
      console.error("JWT token expired:", err.message);
      res.status(403).json({ message: "Refresh token expired" });
      return;
    }

    // Database or other errors
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};