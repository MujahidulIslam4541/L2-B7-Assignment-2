# DevPulse - Assignment Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Prerequisites

- Node.js 24.x or higher
- PostgreSQL (running locally or remote)
- npm or yarn

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/devpulse
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 2. Database Setup

Before running the application, ensure PostgreSQL is running:

```bash
# Create database (run in PostgreSQL terminal)
CREATE DATABASE devpulse;
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8000` and automatically create the database schema.

## API Endpoints

### Authentication Module

#### Sign Up (Public)

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

#### Login (Public)

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

### Issues Module

#### Create Issue (Authenticated)

```
POST /api/issues
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

#### Get All Issues (Public)

```
GET /api/issues?sort=newest&type=bug&status=open
```

Query Parameters:

- `sort`: `newest` (default) or `oldest`
- `type`: `bug` or `feature_request` (optional)
- `status`: `open`, `in_progress`, or `resolved` (optional)

#### Get Single Issue (Public)

```
GET /api/issues/:id
```

#### Update Issue (Authenticated)

```
PATCH /api/issues/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "type": "bug"
}
```

**Permissions:**

- Maintainers: Can update any issue
- Contributors: Can only update their own issues if status is "open"

#### Delete Issue (Maintainers Only)

```
DELETE /api/issues/:id
Authorization: Bearer <JWT_TOKEN>
```

## User Roles & Permissions

### Contributor

- Register and log in
- Create new issues
- View all issues
- Update own issues (only if status is open)

### Maintainer

- All contributor permissions
- Update any issue
- Delete any issue
- Change issue workflow status

## Project Structure

```
src/
├── config/
│   ├── database.ts      # Database connection setup
│   └── schema.ts        # Database schema creation
├── middleware/
│   └── auth.ts          # JWT verification and error handling
├── routes/
│   ├── auth.ts          # Authentication endpoints
│   └── issues.ts        # Issues CRUD endpoints
├── utils/
│   └── auth.ts          # Password hashing and JWT utilities
├── types/
│   └── index.ts         # TypeScript type definitions
└── server.ts            # Main server file
```

## Technical Stack

- **Runtime**: Node.js (ES modules)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Status Codes**: http-status-codes

## Database Schema

### Users Table

- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255, NOT NULL)
- email (VARCHAR 255, NOT NULL, UNIQUE)
- password (VARCHAR 255, NOT NULL)
- role (VARCHAR 20, DEFAULT 'contributor')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Issues Table

- id (SERIAL PRIMARY KEY)
- title (VARCHAR 150, NOT NULL)
- description (TEXT, NOT NULL)
- type (VARCHAR 20, NOT NULL: 'bug' or 'feature_request')
- status (VARCHAR 20, DEFAULT 'open': 'open', 'in_progress', 'resolved')
- reporter_id (INTEGER, NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

## HTTP Status Codes

- `200 OK`: Successful GET, PATCH, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Business logic conflict
- `500 Internal Server Error`: Server error
