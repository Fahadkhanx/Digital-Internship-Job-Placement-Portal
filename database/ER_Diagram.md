# Entity Relationship Diagram Documentation

## Database Schema Overview

The Digital Internship & Job Placement Portal database consists of the following main entities:

### Core Entities

1. **Users** - Central authentication table for all user types
2. **Students** - Student-specific profile information
3. **Employers** - Company/employer information
4. **Job Postings** - Job and internship opportunities
5. **Applications** - Student job applications
6. **Messages** - Communication between users
7. **Notifications** - System notifications
8. **Bookmarks** - Student saved jobs

### Relationships

```
Users (1) ──── (1) Students
Users (1) ──── (1) Employers
Users (1) ──── (N) Messages (as sender/receiver)
Users (1) ──── (N) Notifications

Students (1) ──── (N) Education
Students (1) ──── (N) Student_Skills
Students (1) ──── (N) Applications
Students (1) ──── (N) Bookmarks

Employers (1) ──── (N) Job_Postings

Job_Postings (1) ──── (N) Applications
Job_Postings (1) ──── (N) Bookmarks

Applications (1) ──── (N) Messages
```

### Key Features

- **User Authentication**: Centralized user management with role-based access
- **Profile Management**: Separate tables for students and employers
- **Job Matching**: Skills-based matching through student_skills and job required_skills
- **Application Tracking**: Status-based workflow (pending → reviewed → shortlisted → accepted/rejected)
- **Communication**: Direct messaging system linked to applications
- **Notifications**: Real-time updates for users
- **Security**: Password reset tokens, verification system

### Indexes

- Email addresses for fast login
- User types for role-based queries
- Job locations and types for filtering
- Application status for tracking
- Message receivers for inbox queries

