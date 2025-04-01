
# CronTab NestJS Backend

This is the NestJS implementation of the CronTab backend API.

## Description

This backend provides:
- RESTful API for managing cron jobs, projects, users, and logs
- JWT-based authentication system
- Integration with Azure Application Insights for logging
- Scheduling system for running cron jobs

## Installation

```bash
$ npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=crontab

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400

# Azure Application Insights
AZURE_APP_INSIGHTS_INSTRUMENTATION_KEY=your_key
AZURE_APP_INSIGHTS_CONNECTION_STRING=your_connection_string

# Other settings
PORT=3000
NODE_ENV=development
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Project Structure

```
src/
├── auth/                # Authentication module
├── config/              # Configuration module
├── projects/            # Projects module
├── jobs/                # Jobs module
├── logs/                # Logs module
├── users/               # Users module
├── common/              # Shared utilities, guards, interceptors
└── app.module.ts        # Main application module
```

## API Documentation

Once the app is running, you can access the API documentation at:

```
http://localhost:3000/api/docs
```
