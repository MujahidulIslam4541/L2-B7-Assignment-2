import Router from "express";
import { authController } from "./auth.controller";

const route = Router();

route.post("/signup", authController.createUser);

export const authRoutes = route;
