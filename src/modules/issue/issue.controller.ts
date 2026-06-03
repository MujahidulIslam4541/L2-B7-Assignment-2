import type { Request, Response } from "express";
import { issueService } from "./issue.service";

type WithStatusCode = Error & { statusCode?: number };

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporterId = req.user!.id;

    const result = await issueService.issuesServiceCreate(req.body, reporterId);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    const err = error as WithStatusCode;
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to create issue",
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.updateIssue(
      req.params.id as string,
      req.body,
      req.user!,
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error) {
    const err = error as WithStatusCode;
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to update issue",
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    await issueService.deleteIssue(req.params.id as string, req.user!);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    const err = error as WithStatusCode;
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to delete issue",
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query as {
      sort?: string;
      type?: string;
      status?: string;
    };

    const result = await issueService.getIssues(sort, type, status);

    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error) {
    const err = error as WithStatusCode;
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to get issues",
    });
  }
};

const getIssueById = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getIssueById(req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error) {
    const err = error as WithStatusCode;
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to get issue",
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
