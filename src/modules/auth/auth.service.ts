import config from "../../config";
import { pool } from "../../database";
import type { IUser } from "./auth.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userDataSaveInDb = async (userData: IUser) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role)VALUES($1,$2,$3,COALESCE($4, 'contributor'))RETURNING *
    `,
    [userData.name, userData.email, hashedPassword, userData.role],
  );

  delete result.rows[0].password;

  return result.rows[0];
};

const loginUserInDb = async (userData: { email: string; password: string }) => {
  const { email, password } = userData;

  const result = await pool.query("SELECT * FROM users WHERE email =$1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) {
    throw new Error("User not found");
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credentials");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(jwtPayload, config.accessToken, {
    expiresIn: config.accessTokenExpiration as any,
  });

 delete user.password;
  return { token, user };
};

export const authService = {
  userDataSaveInDb,
  loginUserInDb,
};
