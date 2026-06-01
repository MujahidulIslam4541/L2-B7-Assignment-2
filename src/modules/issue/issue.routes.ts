import Router from "express";
import { issueController } from "./issue.controller";
import authMiddleware from "../../middleware/auth";

const router = Router();

router.post("/",authMiddleware, issueController.createIssue);


export const issueRoutes = router;