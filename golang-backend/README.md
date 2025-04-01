
# CronTab Golang Backend

This is the Golang implementation of the CronTab backend API.

## Description

This backend provides:
- RESTful API for managing cron jobs, projects, users, and logs
- JWT-based authentication system
- Integration with Azure Application Insights for logging
- Scheduling system for running cron jobs

## Requirements

- Go 1.18 or higher
- MySQL or PostgreSQL

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/crontab-go.git
cd crontab-go

# Install dependencies
go mod download
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3000
ENV=development

# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=crontab

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400

# Azure Application Insights
AZURE_APP_INSIGHTS_CONNECTION_STRING=your_connection_string
```

## Running the app

```bash
# Build the application
go build -o crontab-api cmd/api/main.go

# Run the application
./crontab-api

# Or directly with Go
go run cmd/api/main.go
```

## Development

```bash
# Run with hot reload (requires air - github.com/cosmtrek/air)
air
```

## Testing

```bash
# Run tests
go test ./...

# Run tests with coverage
go test ./... -cover
```

## Project Structure

```
├── cmd/
│   └── api/                # API entry point
├── internal/
│   ├── config/             # Configuration
│   ├── controllers/        # HTTP handlers
│   ├── middleware/         # HTTP middleware
│   ├── models/             # Database models
│   ├── repositories/       # Data access layer
│   ├── routes/             # HTTP routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── pkg/                    # Shared packages
│   ├── azure/              # Azure integration
│   ├── logger/             # Logging
│   └── scheduler/          # Cron job scheduler
└── go.mod                  # Go modules
```

## API Documentation

Once the app is running, you can access the API documentation at:

```
http://localhost:3000/swagger/index.html
```
