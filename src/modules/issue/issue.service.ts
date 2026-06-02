
import { pool } from "../../database";
import type { Issue, IssueRow } from "./issue.types";

type IssueActor = {
  id: number;
  role: "maintainer" | "contributor";
};


const buildError = (message: string, statusCode: number) => {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
};


const validateIssueInput = (issueData: Partial<Issue>, isUpdate = false) => {
  if (!isUpdate || issueData.title !== undefined) {
    if (!issueData.title || issueData.title.trim() === "") {
      throw buildError(
        isUpdate ? "Title cannot be empty" : "Title is required",
        400
      );
    }
    if (issueData.title.length > 150) {
      throw buildError("Title must be at most 150 characters", 400);
    }
  }

  if (!isUpdate || issueData.description !== undefined) {
    if (!issueData.description || issueData.description.trim() === "") {
      throw buildError(
        isUpdate ? "Description cannot be empty" : "Description is required",
        400
      );
    }
    if (issueData.description.length < 20) {
      throw buildError("Description must be at least 20 characters", 400);
    }
  }

  if (!isUpdate || issueData.type !== undefined) {
    if (!issueData.type || !["bug", "feature_request"].includes(issueData.type)) {
      throw buildError("Type must be bug or feature_request", 400);
    }
  }
};

const getIssueOrThrow = async (id: string): Promise<IssueRow> => {
  const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
  const issue = result.rows[0];

  if (!issue) {
    throw buildError("Issue not found", 404);
  }

  return issue as IssueRow;
};


const getIssueWithReporter = async (issue: IssueRow) => {
  const reporterResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id]
  );

  const { reporter_id, ...rest } = issue;

  return {
    ...rest,
    reporter: reporterResult.rows[0] || null,
  };
};

const canContributorUpdate = (issue: IssueRow, user: IssueActor) => {
  return issue.reporter_id === user.id && issue.status === "open";
};


const issuesServiceCreate = async (
  issuesData: Issue,
  reporterId: number
): Promise<IssueRow> => {
  validateIssueInput(issuesData);

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [issuesData.title, issuesData.description, issuesData.type, reporterId]
  );

  return result.rows[0];
};

const getIssues = async (sort?: string, type?: string, status?: string) => {
  const conditions: string[] = [];
  const values: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  let query = "SELECT * FROM issues";

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += sort === "oldest" ? " ORDER BY created_at ASC" : " ORDER BY created_at DESC";

  const issuesResult = await pool.query(query, values);
  const issues: IssueRow[] = issuesResult.rows;

  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  const reportersResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = ANY($1::int[])",
    [reporterIds]
  );

  const reporterMap: Record<number, { id: number; name: string; role: string }> = {};
  reportersResult.rows.forEach((reporter) => {
    reporterMap[reporter.id] = reporter;
  });

  return issues.map((issue) => {
    const { reporter_id, ...rest } = issue;
    return {
      ...rest,
      reporter: reporterMap[issue.reporter_id] || null,
    };
  });
};

const getIssueById = async (id: string) => {
  const issue = await getIssueOrThrow(id);
  return getIssueWithReporter(issue);
};

const updateIssue = async (
  id: string,
  issueData: Partial<Issue>,
  user: IssueActor
) => {
  if (!issueData.title && !issueData.description && !issueData.type) {
    throw buildError("At least one field is required to update the issue", 400);
  }

  validateIssueInput(issueData, true);

  const issue = await getIssueOrThrow(id);

  if (user.role !== "maintainer" && !canContributorUpdate(issue, user)) {
    throw buildError("You are not allowed to update this issue", 403);
  }
  const result = await pool.query(
    `UPDATE issues
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [
      issueData.title ?? null,
      issueData.description ?? null,
      issueData.type ?? null,
      id,
    ]
  );

  return result.rows[0];
};

const deleteIssue = async (id: string, user: IssueActor) => {
  if (user.role !== "maintainer") {
    throw buildError("Only maintainers can delete issues", 403);
  }
  const issue = await getIssueOrThrow(id);

  await pool.query("DELETE FROM issues WHERE id = $1", [issue.id]);
};

export const issueService = {
  issuesServiceCreate,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};