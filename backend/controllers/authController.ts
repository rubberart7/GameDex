import { User } from "../generated/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt"
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { hash } from "crypto";

dotenv.config();

const prisma = new PrismaClient();

interface RegisterReqBody {
    fullName: string,
    email: string,
    password:string,
}

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

const register = async (req: Request<{}, {}, RegisterReqBody>, res: Response) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingEmail = await prisma.user.findUnique({
        where: { email: email },
    });

    if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await createUser(fullName, email, hashedPassword);
    

}

