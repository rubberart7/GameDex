import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

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

    const emailExists = await findUserByEmail(email);
    if (emailExists) {
      res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(fullName, email, hashedPassword);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
	// the catch block automatically recieves an error object
    next(error);
  }
};

export const login = async (
	req: Request<{}, {}, RegisterRequestBody>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400).json({ message: "Please enter all fields" });
		}

		const user = await findUserByEmail(email);

		if (!user) {
			res.status(400).json({ message: "Invalid credentials"});
		}

		const isCorrectPassword = bcrypt.compare(password, user.password);

		if (!isCorrectPassword) {
			res.status(400).json({ message: "Invalid credentials"});
		}


	} catch (error) {
		next(error);
	}
}

