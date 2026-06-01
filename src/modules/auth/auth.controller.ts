import type { Request, Response } from "express";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.userDataSaveInDb(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: (error as Error).message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserInDb(req.body);

    // if (!result) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid email or password",
    //   });
    // }

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to login user",
      error: (error as Error).message,
    });
  }
};
export const authController = {
  createUser,
  loginUser,
};
