import config from "../../config";
import { pool } from "../../database";
import type { IUser } from "./auth.types";
type WithStatusCode = Error & { statusCode?: number };
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userDataSaveInDb = async (userData: IUser) => {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    userData.email,
  ]);
  if (existing.rows.length > 0) {
    const error = new Error("Email already exists");
    (error as WithStatusCode).statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const result = await pool.query(
    `INSERT INTO users(name, email, password, role)
     VALUES($1, $2, $3, COALESCE($4, 'contributor'))
     RETURNING *`,
    [userData.name, userData.email, hashedPassword, userData.role],
  );

  const { password: _, ...userWithoutPassword } = result.rows[0];
  return userWithoutPassword;
};

const loginUserInDb = async (userData: { email: string; password: string }) => {
  const { email, password } = userData;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user) {
    const error = new Error("User not found");
    (error as WithStatusCode).statusCode = 404;
    throw error;
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    const error = new Error("Invalid credentials");
    (error as WithStatusCode).statusCode = 401;
    throw error;
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.accessToken, {
    expiresIn: config.accessTokenExpiration as any,
  });

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

export const authService = {
  userDataSaveInDb,
  loginUserInDb,
};
