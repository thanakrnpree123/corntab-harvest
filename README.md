
# Corntab - Modern Cron Job Management System

A comprehensive cron job management system that allows users to create, monitor, and manage scheduled tasks across multiple projects with a modern Material UI interface.

## User Stories for Azure DevOps

### Epics

#### 1. Job Management System
The core system that enables users to create, configure, and manage automated jobs across different projects with an intuitive UI.

#### 2. Monitoring and Analytics
A comprehensive system for tracking job performance, identifying issues, and providing visual insights into system efficiency.

#### 3. User Management and Security
A system to manage user access, permissions, and secure the platform according to industry standards with role-based access control.

#### 4. UI/UX and Responsiveness
A modern, responsive interface built with Material UI that provides a seamless experience across desktop and mobile devices.

### Features

#### Under Epic: Job Management System
1. **Project Organization**
   - Create and manage multiple projects to organize related jobs
   - Project-level configurations and dashboard views
   - Quick project switching via dropdown selector

2. **Job Configuration**
   - Comprehensive job creation with intuitive modal interface
   - Support for cron expression scheduling with human-readable preview
   - Advanced command execution settings with environment variable support

3. **Job Execution Control**
   - One-click job status toggling (active/paused)
   - Manual job triggering for on-demand execution
   - Job duplication and quick editing capabilities

#### Under Epic: Monitoring and Analytics
1. **Dashboard and Visualization**
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

3. **Security Features**
   - Encrypted storage of sensitive data
   - Protection against common web vulnerabilities
   - Regular security updates and patches

#### Under Epic: UI/UX and Responsiveness
1. **Material UI Implementation**
   - Modern, clean interface using Material UI components
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

### Stories

#### Under Feature: Project Organization
1. As a user, I want to quickly switch between projects via a dropdown selector, so I can efficiently manage multiple projects.
   - Acceptance Criteria:
     - Dropdown shows all accessible projects
     - Current project is highlighted
     - Project switch updates all related views instantly

2. As a user, I want project-specific dashboards, so I can focus on relevant metrics for each project.
   - Acceptance Criteria:
     - Dashboard displays only data for selected project
     - Project-specific statistics and recent activity
     - Quick actions relevant to current project context

3. As a user, I want to see at-a-glance project health indicators, so I can identify issues quickly.
   - Acceptance Criteria:
     - Visual indicators for overall project health
     - Count of problematic jobs highlighted
     - Trend indicators comparing to previous periods

#### Under Feature: Job Configuration
1. As a user, I want an intuitive modal for creating jobs with form validation, so I can avoid errors in job setup.
   - Acceptance Criteria:
     - Modal form with clear field labels
     - Real-time validation of inputs
     - Helpful error messages for invalid inputs

2. As a user, I want to see a human-readable preview of my cron schedule, so I understand exactly when jobs will run.
   - Acceptance Criteria:
     - English description of cron expression
     - Next run date/time calculation
     - Visual calendar representation of schedule

3. As a user, I want to configure environment variables and execution parameters, so jobs run in the correct context.
   - Acceptance Criteria:
     - Key-value pair interface for environment variables
     - Secure storage of sensitive values
     - Option to inherit variables from project settings

#### Under Feature: Dashboard and Visualization
1. As a user, I want a comprehensive dashboard with key metrics, so I can assess system health at a glance.
   - Acceptance Criteria:
     - Summary cards for total jobs, success rate, etc.
     - Recent job execution timeline
     - Quick access to commonly used actions

2. As a user, I want visual representations of job performance, so I can identify trends and issues.
   - Acceptance Criteria:
     - Charts showing success/failure rates
     - Time-series graphs of execution metrics
     - Comparative analysis with previous periods

3. As a user, I want a responsive layout that works well on mobile devices, so I can monitor jobs on the go.
   - Acceptance Criteria:
     - Dashboard adapts to small screens
     - Touch-friendly controls
     - Critical information prioritized on mobile view

#### Under Feature: Detailed Job Logs
1. As a user, I want to view and search through detailed execution logs, so I can troubleshoot issues effectively.
   - Acceptance Criteria:
     - Full command output capture
     - Timestamp for each log entry
     - Full-text search functionality

2. As a user, I want to filter logs by severity level, date range, and status, so I can focus on relevant information.
   - Acceptance Criteria:
     - Multi-criteria filtering interface
     - Quick filter presets for common scenarios
     - Ability to save custom filter settings

3. As a user, I want to export logs for external analysis, so I can use specialized tools for debugging.
   - Acceptance Criteria:
     - Export to common formats (JSON, CSV)
     - Option to include or exclude metadata
     - Batch export for multiple job logs

## Getting Started

See our backend documentation for installation and setup instructions:
- [NestJS Backend](nestjs-backend/README.md)
- [Golang Backend](golang-backend/README.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
