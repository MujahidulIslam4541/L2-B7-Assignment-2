import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes";


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running" });
});


app.use("/api/auth", authRoutes);

export default app;
