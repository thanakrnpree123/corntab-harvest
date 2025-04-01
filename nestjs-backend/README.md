
# CronTab NestJS Backend

## Overview

CronTab NestJS Backend is a modern, feature-rich backend service for managing and executing scheduled tasks. Built with NestJS and TypeORM, it provides a RESTful API for creating, managing, and monitoring cron jobs.

## Features

- RESTful API for job and project management
- JWT authentication and role-based authorization
- Real-time job scheduling with cron syntax
- Job execution monitoring and logging
- Timezone support for jobs
- SQL Server database storage
- Comprehensive API documentation with Swagger

## Requirements

- Node.js 16.x or higher
- Microsoft SQL Server (or Azure SQL)
- Docker (optional, for containerization)

## Installation

Clone the repository and install dependencies:

```bash
# Clone the repo
git clone https://github.com/yourusername/crontab-nestjs.git

# Enter the project directory
cd crontab-nestjs

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory:

```
# Application
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES=1d

# Database Connection
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_DATABASE=crontab
```

## Database Setup

Run a Microsoft SQL Server instance:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Swagger documentation is available at `http://localhost:3000/api/docs` when the server is running.

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Authenticate and get token
- POST `/api/auth/validate` - Validate a JWT token

### Projects

- GET `/api/projects` - List all projects
- GET `/api/projects/:id` - Get project details
- POST `/api/projects` - Create a new project
- PUT `/api/projects/:id` - Update a project
- DELETE `/api/projects/:id` - Delete a project

### Jobs

- GET `/api/jobs` - List all jobs
- GET `/api/jobs/:id` - Get job details
- GET `/api/jobs/project/:projectId` - List all jobs for a project
- POST `/api/jobs` - Create a new job
- PUT `/api/jobs/:id` - Update a job
- DELETE `/api/jobs/:id` - Delete a job

### Logs

- GET `/api/logs/job/:jobId` - Get execution logs for a job
- POST `/api/logs` - Create a new log entry

### Users and Roles

- GET `/api/users` - List all users
- GET `/api/users/:id` - Get user details
- POST `/api/users` - Create a new user
- PUT `/api/users/:id` - Update a user
- DELETE `/api/users/:id` - Delete a user
- GET `/api/roles` - List all roles

## Architecture

The application follows NestJS clean architecture patterns:

- Controllers: Handle HTTP requests and responses
- Services: Implement business logic
- Repositories: Interact with the database
- DTOs: Define data transfer objects for validation
- Entities: Define database models
- Modules: Organize related functionality
- Guards: Handle authentication and authorization

## License

MIT License
