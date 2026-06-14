DevPulse Issue Manager

DevPulse is a backend REST API built for managing software issues like bugs and feature requests. It is developed using Node.js, Express, TypeScript, PostgreSQL, and secured with JWT authentication. The system also includes role-based access control (RBAC) for better permission handling.

🌐 Live API

https://dev-pulse-issue-mang.vercel.app/

**Tech Stack**
Node.js
Express.js
TypeScript
PostgreSQL
JWT (authentication)
bcrypt (password hashing)
dotenv

**Key Features**
User registration and login system with JWT
Secure authentication and password hashing
Role-based access control (Contributor & Maintainer)
Full CRUD operations for issues
Ability to track bugs and feature requests
Protected routes for sensitive operations
PostgreSQL database integration with structured schema

**Authentication Routes**
POST /api/auth/signup → Create a new user account
POST /api/auth/login → Login user and receive JWT token
** Issue Management Routes**
POST /api/issues → Create a new issue (requires login)
GET /api/issues → Retrieve all issues
GET /api/issues/:id → Get details of a single issue
PUT /api/issues/:id → Update an issue (role-based access)
DELETE /api/issues/:id → Delete an issue (maintainer only)

DevPulse – Issue Tracker API

DevPulse is a backend REST API built for managing software issues like bugs and feature requests. It is developed using Node.js, Express, TypeScript, PostgreSQL, and secured with JWT authentication. The system also includes role-based access control (RBAC) for better permission handling.

🌐 Live API

https://dev-pulse-issue-mang.vercel.app/

⚙️ Tech Stack
Node.js
Express.js
TypeScript
PostgreSQL
JWT (authentication)
bcrypt (password hashing)
dotenv
🚀 Key Features
User registration and login system with JWT
Secure authentication and password hashing
Role-based access control (Contributor & Maintainer)
Full CRUD operations for issues
Ability to track bugs and feature requests
Protected routes for sensitive operations
PostgreSQL database integration with structured schema
🔐 Authentication Routes
POST /api/auth/signup → Create a new user account
POST /api/auth/login → Login user and receive JWT token
🐛 Issue Management Routes
POST /api/issues → Create a new issue (requires login)
GET /api/issues → Retrieve all issues
GET /api/issues/:id → Get details of a single issue
PUT /api/issues/:id → Update an issue (role-based access)
DELETE /api/issues/:id → Delete an issue (maintainer only)
👥 User Roles
🧑 Contributor
Can register and log in
Can create and view issues
Can update only their own open issues
🛠 Maintainer
Full access to all issues
Can update or delete any issue
Controls issue workflow and status


**Database Overview**
Users Table
Stores user information such as name, email, encrypted password, role, and timestamps.

Issues Table
Stores issue data including title, description, type (bug/feature), status, reporter ID, and timestamps.

**Contributor**
Can register and log in
Can create and view issues
Can update only their own open issues
🛠 Maintainer
Full access to all issues
Can update or delete any issue
Controls issue workflow and status

** Database Overview**
Users Table

Stores user information such as name, email, encrypted password, role, and timestamps.

Issues Table

Stores issue data including title, description, type (bug/feature), status, reporter ID, and timestamps.
