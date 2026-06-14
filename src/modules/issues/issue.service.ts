import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssueService = async (reporter_id: number, payload: IIssue) => {
  const { title, type, description, status } = payload;

  const result = await pool.query(
    `
    INSERT INTO issues (reporter_id, title, type, description,status)
    VALUES ($1, $2, $3, $4,$5)
    RETURNING *
    `,
    [reporter_id, title, type, description, status],
  );

  return result.rows[0];
};



const getAllIssuesService = async (filters: any) => {
  let query = `SELECT * FROM issues`;
  const values: any[] = [];
  const conditions: string[] = [];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  const sort = filters.sort || "newest";

  if (sort === "newest") {
    query += ` ORDER BY created_at DESC`;
  } else if (sort === "oldest") {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(query, values);
  return result.rows;
};

const getSingleIssueService = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1  
        `,
    [id],
  );
  return result;
};

const updateIssueService = async (
  payload: IIssue,
  id: string,
  user: JwtPayload,
) => {
  const { title, type, status, description } = payload;

  const issueData = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );

  if (issueData.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueData.rows[0];

  // Set update rules for contributor
  if (
    user.role === "contributor" &&
    Number(issue.reporter_id) !== Number(user.id)
  ) {
    throw new Error("You can only update your own issue");
  }
  if (user.role === "contributor" && issue.status !== "open") {
    throw new Error("You only can update an 'Open issue' ");
  }

  // update issue
  const result = await pool.query(
    `
    UPDATE issues 
    SET 
    title=COALESCE($1,title),
    type=COALESCE($2,type),
    status=COALESCE($3,status),
    description=COALESCE($4,description)
   
    WHERE id=$5 RETURNING *
    `,
    [title, type, status, description, id],
  );

  return result.rows[0];
};

const deleteIssueService = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1  
      `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueService,
  getAllIssuesService,
  getSingleIssueService,
  updateIssueService,
  deleteIssueService,
};