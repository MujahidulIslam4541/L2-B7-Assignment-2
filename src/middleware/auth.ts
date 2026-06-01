import type { NextFunction, Request, Response } from "express";
import config from "../config";
import jwt from "jsonwebtoken";
import { pool } from "../database";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Auth middleware executed", req.headers.authorization);
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access! No token provided.",
    });
  }

  const decodedToken = jwt.verify(authToken, config.accessToken) as {
    id: string;
  };
  console.log("Decoded token:", decodedToken);

  const issueData = await pool.query("SELECT * FROM users WHERE id = $1", [
    decodedToken.id,
  ]);
  console.log("User data from DB:", issueData.rows);
  if (issueData.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access! Invalid token.",
    });
  }
  next();
};

export default authMiddleware;
