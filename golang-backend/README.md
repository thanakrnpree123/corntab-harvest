
# CronTab Golang Backend

## Overview

CronTab Go Backend is a high-performance, feature-rich backend service for managing and executing scheduled tasks. Built with Go and Echo framework, it provides a RESTful API for creating, managing, and monitoring cron jobs.

## Features

- RESTful API for job and project management
- Authentication and authorization
- Real-time job scheduling with cron syntax
- Job execution monitoring and logging
- Timezone support for jobs
- SQL Server database storage
- Comprehensive documentation with Swagger

## Requirements

- Go 1.18 or higher
- Microsoft SQL Server (or Azure SQL)
- Docker (optional, for containerization)

## Installation

Clone the repository and install dependencies:

```bash
# Clone the repo
git clone https://github.com/yourusername/crontab-go.git

# Enter the project directory
cd crontab-go

# Download dependencies
go mod download
```

## Configuration

Set up the environment variables in a `.env` file:

```
# Server settings
PORT=3000
DEBUG=true

# Database settings
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_NAME=crontab
```

## Database Setup

Run a Microsoft SQL Server instance:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest
```

The application will automatically create the necessary tables when first started.

## Running the Application

```bash
# Development mode
go run cmd/api/main.go

# Build and run in production
go build -o crontab cmd/api/main.go
./crontab
```

## API Documentation

Swagger documentation is available at `http://localhost:3000/swagger/index.html` when the server is running.

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Authenticate and get token
- POST `/api/auth/validate` - Validate an auth token

### Projects

- GET `/api/projects` - List all projects
- GET `/api/projects/{id}` - Get project details
- POST `/api/projects` - Create a new project
- PUT `/api/projects/{id}` - Update a project
- DELETE `/api/projects/{id}` - Delete a project

### Jobs

- GET `/api/jobs` - List all jobs
- GET `/api/jobs/{id}` - Get job details
- GET `/api/jobs/project/{projectId}` - List all jobs for a project
- POST `/api/jobs` - Create a new job
- PUT `/api/jobs/{id}` - Update a job
- DELETE `/api/jobs/{id}` - Delete a job
- GET `/api/jobs/{id}/logs` - Get execution logs for a job
- POST `/api/jobs/{id}/logs` - Create a new log entry for a job

## Architecture

The application follows a clean architecture pattern:

- `cmd/api`: Main application entry point
- `internal/models`: Data models and database operations
- `internal/handlers`: API endpoint handlers
- `internal/middleware`: HTTP middleware functions
- `internal/routes`: API route configuration
- `internal/config`: Application configuration
- `pkg/logger`: Logging utilities
- `pkg/scheduler`: Job scheduling and execution engine

## License

MIT License
