import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";

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
  await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
    },
  });
}

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ message: "Please fill all fields", type: "Error" });
    return
  }

  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters!", type: "Error" });
    return
  }

  const emailExists = await findUserByEmail(email);
  if (emailExists) {
    res.status(400).json({ message: "Email already exists!", type: "Error" });
    return
  }

  const hashedPassword = await hashPassword(password);
  await createUser(fullName, email, hashedPassword);

  res.status(201).json({ message: "User registered successfully.", type: "Success" });
  return
};

export const login = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please enter all fields", type: "Error" });
    return
  }

  const user = await findUserByEmail(email);

  if (!user) {
    res.status(400).json({ message: "Username not correct!", type: "Error" });
    return
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) {
    res.status(400).json({ message: "Password incorrect!", type: "Error" });
    return
  }

  res.status(201).json({ message: "User logged in successfully." , type: "Success"});
  return
};
