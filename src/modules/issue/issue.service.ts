import type { Issue } from "./issue.types";

const issuesServiceCreate = (issuesData: Issue) => {
  console.log(issuesData);
};

export const issueService = {
  issuesServiceCreate,
};
