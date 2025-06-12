import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { create } from "domain";

dotenv.config();

const prisma = new PrismaClient();

interface RegisterRequestBody {
  fullName: string;
  email: string;
  password: string;
}

const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

async function createUser(fullName: string, email: string, hashedPassword: string) {
  const newUser = await prisma.user.create({
    data: {
      fullName: fullName,      
      email: email,           
      password: hashedPassword 
    },
  });

  return newUser;
}

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Controller
export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "Please fill all fields" });
    }

	if (password.length < 6) {
		res.status(400).json({ message: "Password must be at least 6 characters!"});
    }

    // Check if user already exists
    const emailExists = await findUserByEmail(email);
    if (emailExists) {
      res.status(409).json({ message: "Email already exists" });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await createUser(fullName, email, hashedPassword);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};