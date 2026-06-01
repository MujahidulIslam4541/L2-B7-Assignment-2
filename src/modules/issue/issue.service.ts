import { pool } from "../../database";
import type { Issue, IssueRow } from "./issue.types";

const issuesServiceCreate = async (
  issuesData: Issue,
  reporterId: number,
): Promise<IssueRow> => {
  // Validation
  if (!issuesData.title || issuesData.title.trim() === "") {
    const error = new Error("Title is required");
    (error as any).statusCode = 400;
    throw error;
  }

  if (issuesData.title.length > 150) {
    const error = new Error("Title must be at most 150 characters");
    (error as any).statusCode = 400;
    throw error;
  }

  if (!issuesData.description || issuesData.description.trim() === "") {
    const error = new Error("Description is required");
    (error as any).statusCode = 400;
    throw error;
  }

  if (issuesData.description.length < 20) {
    const error = new Error("Description must be at least 20 characters");
    (error as any).statusCode = 400;
    throw error;
  }

  if (!["bug", "feature_request"].includes(issuesData.type)) {
    const error = new Error("Type must be bug or feature_request");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [issuesData.title, issuesData.description, issuesData.type, reporterId],
  );

  return result.rows[0];
};

const getIssues = async (sort?: string, type?: string, status?: string) => {
  let query = "SELECT * FROM issues";
  const conditions: string[] = [];

  if (type) conditions.push(`type = '${type}'`);
  if (status) conditions.push(`status = '${status}'`);
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");

  query +=
    sort === "oldest"
      ? " ORDER BY created_at ASC"
      : " ORDER BY created_at DESC";

  const issuesResult = await pool.query(query);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  const reporterIds = [
    ...new Set(issues.map((issue: IssueRow) => issue.reporter_id)),
  ];

  const reportersResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = ANY($1::int[])",
    [reporterIds],
  );

  const reporterMap: Record<
    number,
    { id: number; name: string; role: string }
  > = {};
  reportersResult.rows.forEach((reporter) => {
    reporterMap[reporter.id] = reporter;
  });

  const issuesWithReporter = issues.map((issue: IssueRow) => {
    const { reporter_id, created_at, updated_at, ...rest } = issue;
    return {
      ...rest,
      reporter: reportersResult.rows[0] || null,
      created_at,
      updated_at,
    };
  });

  return issuesWithReporter;
};

const getIssueById = async (id: string) => {
  const issueResult = await pool.query("SELECT * FROM issues WHERE id = $1", [
    id,
  ]);
  const issue = issueResult.rows[0];

  if (!issue) {
    const error = new Error("Issue not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const reporterResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id],
  );

  const { reporter_id, created_at, updated_at, ...rest } = issue;
  return {
    ...rest,
    reporter: reporterResult.rows[0] || null,
    created_at,
    updated_at,
  };
};

export const issueService = {
  issuesServiceCreate,
  getIssues,
  getIssueById,
};
