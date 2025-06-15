// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { Request, Response, NextFunction } from "express";

// dotenv.config()

// const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

// const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//         res.sendStatus(401);
//         return;
//     }

//     console.log(authHeader);
//     const token = authHeader.split(' ')[1];
//     jwt.verify(
//         token,
//         accessTokenSecret,
//         (err, decoded) => {
//             if (err) {
//                 res.status(403);
//                 return;
//             }
//             req.id = 
//         }
//     )
// }