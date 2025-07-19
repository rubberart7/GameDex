import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../libs/utils";

dotenv.config();

const prisma = new PrismaClient();

export const addToLibrary = () => {
    return;
}