import jwt from "jsonwebtoken"


const generateAccessToken = (userId: string, secretKey: string) => {
  return jwt.sign({ userId }, secretKey, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId: string, secretKey: string) => {
  return jwt.sign({ userId }, secretKey, {
    expiresIn: "15m",
  });
};

