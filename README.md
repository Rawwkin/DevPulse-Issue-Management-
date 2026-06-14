DevPulse – Issue Tracker API

DevPulse is a backend REST API for managing bugs and feature requests. It is built with Node.js, Express, TypeScript, PostgreSQL, and uses JWT authentication with role-based access control.

🌐 Live API

https://dev-pulse-issue-mang.vercel.app/

⚙️ Tech Stack
Node.js
Express.js
TypeScript
PostgreSQL
JWT Authentication
bcrypt
🚀 Features
User signup & login with JWT
Role-based access (Contributor / Maintainer)
Create, read, update, delete issues
Secure password hashing
PostgreSQL database integration
🔐 Auth Routes
POST /api/auth/signup – Register user
POST /api/auth/login – Login & get token
🐛 Issue Routes
POST /api/issues – Create issue (auth required)
GET /api/issues – Get all issues
GET /api/issues/:id – Get single issue
PUT /api/issues/:id – Update issue (role-based)
DELETE /api/issues/:id – Delete issue (maintainer only)
👥 Roles

Contributor: create & manage own issues
Maintainer: manage all issues
