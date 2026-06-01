import type { NextFunction, Request, Response } from "express";
import config from "../config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { pool } from "../database";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access! No token provided.",
    });
  }

  try {
    const decodedToken = jwt.verify(
      authToken,
      config.accessToken,
    ) as JwtPayload;

    const userData = await pool.query("SELECT * FROM users WHERE id = $1", [
      decodedToken.id,
    ]);

    if (userData.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access! Invalid token.",
      });
    }

    req.user = userData.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access! Invalid token.",
    });
  }
};

export default authMiddleware;
