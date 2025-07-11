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
// Tries to read the Authorization header from the request (this is where the token is usually sent).

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
//   If there is no token, or it's not in the correct format (Bearer <token>), the user gets a 401 Unauthorized error.

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("Missing ACCESS_TOKEN_SECRET");

    const decoded = jwt.verify(token, secret) as JwtPayload;

// This line verifies the token using the secret.

// If the token is invalid or expired, it throws an error.

// If it's valid, decoded contains the original info you put into the token (userId, email).
// The payload is a JSON object that includes claims — pieces of information about the user and the token itself.
// the JSON payload is a JSON object that contains all of the information that the token was signed with
// the frontend will send a request with Authorization: Bearer <accesstoken> format and then the .verify uses secret to verify that the token is correct and matches what is expected
// Here is more detail:
// Here's what jwt.verify(token, secret) does step-by-step:

// Checks the token's signature:
// It uses the secret key to decrypt and verify that the token's signature matches the payload and header. This confirms the token was created by your server (or whoever has the secret) and hasn’t been tampered with.

// Validates the token's expiration and claims:
// It checks standard claims like exp (expiration time) and nbf (not before), to ensure the token is still valid (not expired or not yet valid).

// If valid, returns the decoded payload:
// If the signature is correct and the token is still valid, it returns the decoded payload — the object you originally signed (e.g., { userId, email, iat, exp }).

// If invalid, throws an error:
// If the signature is wrong, the token expired, or something else is off, jwt.verify throws an error, so you know the token is not trustworthy.

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    //  Attach decoded user info to req.user:
    // Now the request contains the user info — useful in the next middleware or route handler.
    // other routes/controller can access this to use it for later

// So in your route handler, you can do something like:

    next();
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
};

// You will use verifyJWT middleware with protected routes when you are already logged in