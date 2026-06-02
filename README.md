# DevPulse API

Backend API for tracking technical issues and feature requests with role-based access control for contributors and maintainers.

## Project Overview

- Project Name: DevPulse API
- Live URL: Not deployed yet (add your production link here)
- Base URL (local): http://localhost:8000

## Core Features

- User registration and login with JWT authentication
- Role-based authorization with maintainer and contributor roles
- Create issue with validation for title, description, and type
- View issues with optional filtering by type and status
- Sort issue list by newest or oldest
- View single issue details by issue ID
- Update issue rules:
  - Maintainer can update any issue
  - Contributor can update only own issue when status is open
- Delete issue rules:
  - Maintainer only
- Consistent JSON response pattern for success and errors

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express.js
- Database: PostgreSQL
- Authentication: JSON Web Token (jsonwebtoken)
- Password Hashing: bcrypt
- Environment Config: dotenv

## Setup Guide

### 1) Clone and install

- Clone this repository
- Install dependencies:
  - npm install

### 2) Create environment file

Create a .env file at the project root and set:

- PORT=8000
- DATABASE_URL=postgresql://postgres:password@localhost:5432/devpulse
- ACCESS_TOKEN_SECRET=your_super_secret_key
- ACCESS_TOKEN_EXPIRATION=7d

### 3) Prepare database

- Create a PostgreSQL database named devpulse (or use your preferred name in DATABASE_URL)
- On server start, tables are auto-created by the app

### 4) Run the server

- Development:
  - npm run dev
- One-time run:
  - npm start

## API Endpoint List

### Health

- GET /

### Auth

- POST /api/auth/signup
- POST /api/auth/login

### Issues

- POST /api/issues
  - Access: Authenticated user
- GET /api/issues
  - Optional query params:
    - sort: newest or oldest
    - type: bug or feature_request
    - status: open, in_progress, resolved
- GET /api/issues/:id
- PATCH /api/issues/:id
  - Access:
    - Maintainer: any issue
    - Contributor: own issue only when status is open
- DELETE /api/issues/:id
  - Access: Maintainer only

## Database Schema Summary

### users table

- id: SERIAL PRIMARY KEY
- name: VARCHAR(100) NOT NULL
- email: VARCHAR(255) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL
- role: VARCHAR(20), default contributor, allowed values maintainer or contributor
- created_at: TIMESTAMP, default NOW()
- updated_at: TIMESTAMP, default NOW()

### issues table

- id: SERIAL PRIMARY KEY
- title: VARCHAR(150) NOT NULL
- description: TEXT NOT NULL
- type: VARCHAR(20), allowed values bug or feature_request
- status: VARCHAR(20), default open, allowed values open, in_progress, resolved
- reporter_id: INTEGER NOT NULL
- created_at: TIMESTAMP, default NOW()
- updated_at: TIMESTAMP, default NOW()

## Response Pattern

Standard success response:

- success: true
- message: operation description
- data: response payload

Standard error response:

- success: false
- message: error description
- errors: error details
