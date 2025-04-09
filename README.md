
# Corntab - Modern Cron Job Management System

A comprehensive cron job management system that allows users to create, monitor, and manage scheduled tasks across multiple projects with a modern responsive UI.

## User Stories

### Epics

#### 1. Project & Job Management System
The core system that enables users to organize jobs into projects and manage automated tasks with an intuitive UI.

#### 2. Monitoring and Analytics
A comprehensive system for tracking job performance, identifying issues, and providing visual insights into system efficiency.

#### 3. User Management and Security
A system to manage user access, permissions, and secure the platform according to industry standards with role-based access control.

#### 4. UI/UX and Responsiveness
A modern, responsive interface that provides a seamless experience across desktop and mobile devices.

### Features

#### Under Epic: Project & Job Management System
1. **Project Organization**
   - Create, edit, and delete projects to organize related jobs
   - Project-level configurations and dashboard views
   - Quick project switching via dropdown selector
   - Import/export projects with their jobs in JSON/CSV formats

2. **Job Configuration**
   - Comprehensive job creation with intuitive modal interface
   - Support for cron expression scheduling with human-readable preview
   - Advanced command execution settings with environment variable support
   - Job status management (activate/pause)

3. **Job Execution Control**
   - One-click job status toggling (active/paused)
   - Manual job triggering for on-demand execution
   - Job duplication and quick editing capabilities
   - Bulk import/export of jobs in JSON/CSV formats

#### Under Epic: Monitoring and Analytics
1. **Dashboard and Visualization**
   - Project-filtered dashboard views
   - At-a-glance status cards showing key metrics
   - Visual representations of job success rates and trends
   - Recent activity timeline with filterable events

2. **Detailed Job Logs**
   - Comprehensive execution logs with timestamps
   - Log filtering and search capabilities
   - Real-time log streaming for active jobs

3. **Performance Metrics**
   - Execution time tracking and performance analysis
   - Resource utilization monitoring
   - Anomaly detection for underperforming jobs

#### Under Epic: User Management and Security
1. **Authentication System**
   - Secure login with JWT token authentication
   - Remember me functionality for improved UX
   - Session management with automatic timeout

2. **Role-Based Access Control**
   - Predefined roles with granular permissions
   - User assignment to projects with specific access levels
   - Activity auditing and access logs

#### Under Epic: UI/UX and Responsiveness
1. **Modern UI Implementation**
   - Clean, intuitive interface using modern UI components
   - Consistent design language throughout the application
   - Dark/light theme support with user preference storage

2. **Mobile Responsiveness**
   - Adaptive layouts for various screen sizes
   - Touch-friendly controls for mobile users
   - Optimized navigation for small screens

3. **Accessibility Compliance**
   - WCAG 2.1 standards compliance
   - Keyboard navigation support
   - Screen reader compatibility

### User Stories

#### Under Feature: Project Organization
1. As a user, I want to organize my jobs into projects, so I can manage related tasks together.
   - Acceptance Criteria:
     - Create, edit, and delete projects
     - View all jobs within a project
     - Add jobs to specific projects
     - Filter jobs by project

2. As a user, I want to import/export projects with their jobs, so I can backup or share my configurations.
   - Acceptance Criteria:
     - Export projects and all associated jobs in JSON or CSV format
     - Import projects and jobs from exported files
     - Validate imported data for correctness
     - Provide clear feedback on import success or failure

3. As a user, I want to quickly navigate between projects, so I can efficiently manage multiple projects.
   - Acceptance Criteria:
     - Dropdown selector for available projects
     - Default to first project if no project is selected
     - Clear indication of which project is currently active
     - Remember last selected project between sessions

#### Under Feature: Job Configuration
1. As a user, I want to create and configure jobs with all necessary parameters, so they run correctly in my environment.
   - Acceptance Criteria:
     - Form for name, description, schedule, endpoint, and method
     - Support for cron expressions with preview
     - Configure HTTP headers and body
     - Set environment variables and timezone

2. As a user, I want to duplicate existing jobs, so I can create similar jobs without retyping all settings.
   - Acceptance Criteria:
     - Single-click job duplication with confirmation
     - New job should have "(copy)" appended to name
     - All settings copied except for run history
     - Immediately editable after duplication

3. As a user, I want to import/export jobs, so I can share job configurations between projects or systems.
   - Acceptance Criteria:
     - Export selected jobs to JSON or CSV
     - Import jobs from JSON or CSV files
     - Validate imported jobs for required fields
     - Option to assign imported jobs to current project

#### Under Feature: Dashboard and Visualization
1. As a user, I want a dashboard that shows job statistics, so I can assess the health of my scheduled tasks.
   - Acceptance Criteria:
     - Cards showing total, active, success, failed, and paused jobs
     - Option to filter dashboard by project
     - List of recent job executions
     - Separate tabs for recent, failed, and paused jobs

2. As a user, I want to see detailed information about a specific job, so I can troubleshoot issues.
   - Acceptance Criteria:
     - Display job configuration details
     - Show execution history and status
     - Provide log output for recent runs
     - Show next scheduled run time

## Getting Started

See our backend documentation for installation and setup instructions:
- [NestJS Backend](nestjs-backend/README.md)
- [Golang Backend](golang-backend/README.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
