
# CronTab

CronTab is a comprehensive job scheduling and monitoring solution designed for DevOps teams and system administrators. It provides an intuitive user interface for managing cron jobs, monitoring their execution, and viewing logs across different projects.

## Features

- **Job Management**: Create, update, and delete cron jobs with detailed configurations
- **Project Organization**: Group jobs into projects for better organization
- **Job Scheduling**: Schedule jobs using standard cron expressions with timezone support
- **Job Monitoring**: Monitor job execution status, run time, and success/failure counts
- **Detailed Logs**: View detailed logs for each job execution
- **Azure Application Insights Integration**: View logs stored in Azure Application Insights
- **User Management**: Role-based access control for team collaboration
- **Multiple Backend Options**: Choose between different backend implementations (Node.js/NestJS or Go)

## User Stories

### As a System Administrator

1. **Job Management**
   - I want to create cron jobs with specific schedules so that tasks run automatically at the defined times
   - I want to group related jobs into projects to keep them organized
   - I want to view all my scheduled jobs in one dashboard to get an overview of system automation
   - I want to pause/resume jobs without deleting them to temporarily stop tasks when needed
   - I want to run jobs manually outside of their schedule to test them or perform immediate tasks

2. **Monitoring**
   - I want to see the status of all jobs (running, successful, failed, paused) to ensure everything is working correctly
   - I want to receive notifications when jobs fail so I can address issues quickly
   - I want to view job execution history to understand patterns and identify recurring issues
   - I want to see execution metrics like average runtime and success rate to evaluate job performance

3. **Logging**
   - I want to view detailed logs for each job execution to troubleshoot issues
   - I want to export logs for archiving or further analysis in other tools
   - I want to integrate with Azure Application Insights to leverage existing logging infrastructure

4. **Configuration**
   - I want to set timezone preferences for job schedules to accommodate distributed teams
   - I want to configure notification preferences to control how I'm alerted about job statuses
   - I want to set automatic retry policies for failed jobs to improve resilience

### As a DevOps Engineer

1. **Team Collaboration**
   - I want to create user accounts for team members so they can access the system based on their roles
   - I want to assign different permissions to users depending on their responsibilities
   - I want to see who created or modified jobs for accountability

2. **Integration**
   - I want to integrate with external notification systems for alerts (future feature)
   - I want the ability to trigger webhooks on job completion to create event-driven workflows (future feature)
   - I want to integrate with cloud provider services for extended functionality (future feature)

3. **Advanced Configuration**
   - I want to set dependencies between jobs so they run in the correct order (future feature)
   - I want to configure resource limits for jobs to prevent system overload (future feature)
   - I want to schedule jobs with more complex patterns beyond standard cron syntax (future feature)

### As a Developer

1. **Job Creation**
   - I want to test commands before scheduling them to ensure they work as expected
   - I want to add detailed descriptions and tags to jobs for better documentation
   - I want to clone existing jobs to create similar ones without starting from scratch

2. **Monitoring**
   - I want to see the output of job executions to verify they're producing the expected results
   - I want to filter jobs by tags, status, or project to focus on relevant information
   - I want to search through job logs to find specific information

## Architecture

The application consists of three main components:

1. **Frontend**: React application with Tailwind CSS and Shadcn UI components
2. **Backend**: Available in multiple implementations:
   - Node.js with NestJS framework (nestjs-backend)
   - Go with Echo framework (golang-backend)
3. **Database**: MySQL or PostgreSQL (configurable)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL or PostgreSQL
- For Golang backend: Go 1.18 or higher

### Setup

1. Clone the repository
2. Configure the backend of your choice (see respective README.md in backend folders)
3. Start the backend server
4. Configure the frontend to connect to your backend
5. Start the frontend application

Refer to the README files in each directory for detailed setup instructions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
