# Digital Internship & Job Placement Portal

A comprehensive web-based platform that connects students with verified employers for internships and entry-level job opportunities.

# Project Overview

This portal provides a centralized, secure platform where:
Students can create profiles, upload resumes, search for jobs, and track applications
Employers can post verified job openings, search student profiles, and manage applications
Administrators can verify employers, manage users, and monitor platform activity

# Technology Stack

Frontend: React.js with responsive design
Backend: C# ASP.NET Core Web API
Database: MySQL Server
Version Control: Git & GitHub
Project Management: Trello (Agile methodology)

# Project Structure

internship-and-job-placement/
├── frontend/              # React.js application
├── backend/               # C# ASP.NET Core Web API
├── database/              # MySQL schema and scripts
└── docs/                  # Documentation


# Development Timeline

Week 1: Requirements and design
Week 2: Database schema and ER diagrams
Week 3: Frontend UI prototype
Week 4: Backend authentication APIs
Week 5: Skill-based matching algorithm
Week 6: Dashboards and communication
Week 7: Testing and optimization
Week 8: Documentation and deployment

# Installation & Setup

# Prerequisites
Node.js (v16 or higher)
.NET 6.0 SDK or higher
MySQL Server 8.0 or higher
Visual Studio 2022 or VS Code

# Database Setup
bash
# MySQL mein database create karein
mysql -u root -p < database/schema.sql


# Backend Setup (C# .NET)
bash
cd backend/InternshipPortal.API
appsettings.json database connection string update 
dotnet restore
dotnet run
API http://localhost:5000 


# Frontend Setup (React)
bash
cd frontend
npm install
.env file create REACT_APP_API_URL 
npm start
Frontend http://localhost:3000 


# Project Structure


internship-and-job-placement/
├── frontend/                    # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── App.js
│   └── package.json
├── backend/                     # C# ASP.NET Core Web API
│   └── InternshipPortal.API/
│       ├── Controllers/         # API controllers
│       ├── Models/              # Data models
│       ├── Services/            # Business logic
│       ├── Data/                # Database context
│       └── Program.cs
├── database/                    # MySQL schema
│   ├── schema.sql
│   └── ER_Diagram.md
└── docs/                        # Documentation
    ├── WEEK_WISE_PLAN.md
    └── GITHUB_UPLOAD_GUIDE.md


# Contributors

Fahad Shah
Khan Huzaifa

# Supervisor

David Keane


