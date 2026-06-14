

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  // connectionString : config.connectionString,
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'contributor'
                    CHECK (role IN ('contributor', 'maintainer')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL
                    CHECK (LENGTH(description) >= 20),
                type VARCHAR(20) NOT NULL
                    CHECK (type IN ('bug', 'feature_request')),
                status VARCHAR(20) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved')),
                reporter_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var allowedRoles = ["contributor", "maintainer"];
var regUsers = async (payload) => {
  const { name, email, password, role } = payload;
  if (role && allowedRoles.includes(role) === false) {
    throw new Error("Invalid role");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        
        INSERT INTO users(name, email, password, role)
        VALUES ($1, $2, $3, COALESCE($4,'contributor')) RETURNING *`,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUSerService = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(` 
        SELECT * FROM users WHERE email = $1`, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential!!");
  }
  const user = userData.rows[0];
  const matchPass = await bcrypt.compare(password, user.password);
  if (matchPass === false) {
    throw new Error("Invalid Credential!!");
  }
  delete user.password;
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt.sign(jwtpayload, config_default.secret, { expiresIn: "1d" });
  return { token: accessToken, user };
};
var authService = {
  regUsers,
  loginUSerService
};

// src/modules/auth/auth.controller.ts
var registerUSer = async (req, res) => {
  try {
    const result = await authService.regUsers(req.body);
    res.status(200).json({
      success: true,
      message: "User has been registered.",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUSer = async (req, res) => {
  try {
    const result = await authService.loginUSerService(req.body);
    res.status(200).json({
      success: true,
      message: "login Successful.",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  registerUSer,
  loginUSer
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.registerUSer);
router.post("/login", authController.loginUSer);
var authRoute = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssue = async (reporter_id, payload) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (reporter_id, title, description, type, status) VAKUES ($1, $2, $3, $4, $5)
        RETURNING *)
        `,
    [reporter_id, title, description, type, status]
  );
  return result.rows[0];
};
var getAllIssue = async (filters) => {
  let query = `SELECT * FROM issues`;
  const values = [];
  const conditions = [];
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
var getSingleIssue = async (id) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1  
          `,
    [id]
  );
  return result;
};
var updateIssue = async (payload, id, user) => {
  const { title, type, status, description } = payload;
  const issueData = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1
      `,
    [id]
  );
  if (issueData.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueData.rows[0];
  if (user.role === "contributor" && Number(issue.reporter_id) !== Number(user.id)) {
    throw new Error("You can only update your own issue");
  }
  if (user.role === "contributor" && issue.status !== "open") {
    throw new Error("You only can update an 'Open issue' ");
  }
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
    [title, type, status, description, id]
  );
  return result.rows[0];
};
var deleteIssue = async (id) => {
  const result = await pool.query(`
        
        DELETE FROM issues WHERE id = $1`, [id]);
  return result;
};
var issueService = {
  createIssue,
  getAllIssue,
  updateIssue,
  getSingleIssue,
  deleteIssue
};

// src/modules/issues/issue.controller.ts
var createIssue2 = async (req, res) => {
  const reporter_id = req.user.id;
  try {
    const result = await issueService.createIssue(reporter_id, req.body);
    res.status(201).json({
      success: true,
      message: "Issue successfully created",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const filters = req.query;
    const result = await issueService.getAllIssue(filters);
    res.status(200).json({
      success: true,
      message: "Issues fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue2 = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssue(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "No issue found!",
        data: null
      });
    }
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue2 = async (req, res) => {
  const id = req.req.params.id;
  try {
    const result = await issueService.updateIssue(
      req.body,
      id,
      req.req.user
    );
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var deleteIssue2 = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssue(id);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "No issue found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue: createIssue2,
  getAllIssues,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(403).json({
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt2.verify(token, config_default.secret);
      const userData = await pool.query(
        `
            
            SELECT * FROM users WHERE email = $1
            `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User invalid!!"
        });
      }
      req.user = decoded;
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Valid token but insufficient role/permissions"
        });
      }
      next();
    } catch (error) {
      if (error) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized"
        });
      }
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var UserRole = {
  maintainer: "maintainer",
  contributor: "contributor"
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth_default(UserRole.maintainer, UserRole.contributor),
  issueController.createIssue
);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch(
  "/:id",
  auth_default(UserRole.maintainer, UserRole.contributor),
  issueController.updateIssue
);
router2.delete("/:id", auth_default(UserRole.maintainer), issueController.deleteIssue);
var issueRoute = router2;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method} - Time -> ${Date.now()} - URL -> ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(
  cors({
    origin: "http://localhost:5000"
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DevPulse Issue management Application"
  });
});
app.use("/api/auth", authRoute);
app.use("/appi/issues", issueRoute);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server is running on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map