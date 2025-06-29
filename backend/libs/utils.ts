import jwt from "jsonwebtoken"


const generateAccessToken = (userId: Number, email: string, secretKey: string) => {
  return jwt.sign({ userId, email }, secretKey, {
    expiresIn: "30s",
  });
};

const generateRefreshToken = (userId: Number, email: string, secretKey: string) => {
  return jwt.sign({ userId, email }, secretKey, {
    expiresIn: "1m",
  });
};

export { generateAccessToken, generateRefreshToken }
