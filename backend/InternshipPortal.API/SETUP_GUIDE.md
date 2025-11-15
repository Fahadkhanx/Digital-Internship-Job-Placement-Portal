# Backend Setup Guide - C# .NET with MySQL

## Prerequisites

- ✅ .NET 6.0 SDK or higher installed
- ✅ MySQL Server 8.0 installed and running
- ✅ Visual Studio 2022 or VS Code

## Step 1: Database Setup

### Create Database

1. **Open MySQL Command Line Client** or **MySQL Workbench**

2. **Run the schema.sql file**:
   ```sql
   SOURCE C:/Users/Taimoor/Desktop/internship and job placement/database/schema.sql;
   ```
   
   Ya command prompt se:
   ```bash
   mysql -u root -p < "C:\Users\Taimoor\Desktop\internship and job placement\database\schema.sql"
   ```

3. **Verify Database Creation**:
   ```sql
   USE internship_job_portal;
   SHOW TABLES;
   ```

## Step 2: Update Connection String

1. **Open** `appsettings.json` file

2. **Update the connection string** with your MySQL credentials:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=internship_job_portal;User=root;Password=YOUR_MYSQL_PASSWORD;Port=3306;CharSet=utf8mb4;"
   }
   ```

   Replace:
   - `YOUR_MYSQL_PASSWORD` with your actual MySQL root password
   - `localhost` with your MySQL server address (if different)
   - `3306` with your MySQL port (if different)

## Step 3: Install Dependencies

Open terminal in the `backend/InternshipPortal.API` folder and run:

```bash
dotnet restore
```

## Step 4: Build the Project

```bash
dotnet build
```

## Step 5: Run the Application

```bash
dotnet run
```

The API will start on:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`

## Step 6: Test Database Connection

1. **Open browser** and go to:
   ```
   http://localhost:5000/api/health
   ```

2. **Expected Response**:
   ```json
   {
     "status": "Healthy",
     "message": "API is running and database is connected",
     "database": "internship_job_portal",
     "timestamp": "2025-10-27T10:00:00Z"
   }
   ```

## Step 7: Test Swagger Documentation

1. **Open browser** and go to:
   ```
   https://localhost:5001/swagger
   ```
   Ya
   ```
   http://localhost:5000/swagger
   ```

2. You should see all available API endpoints

## Common Issues & Solutions

### Issue 1: Database Connection Failed

**Error**: `Unable to connect to any of the specified MySQL hosts`

**Solution**:
- Check if MySQL server is running
- Verify connection string in `appsettings.json`
- Check MySQL port (default is 3306)
- Ensure MySQL allows connections from localhost

### Issue 2: Access Denied

**Error**: `Access denied for user 'root'@'localhost'`

**Solution**:
- Verify MySQL username and password in `appsettings.json`
- Check if MySQL root user has required permissions
- Try creating a new MySQL user:
  ```sql
  CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'your_password';
  GRANT ALL PRIVILEGES ON internship_job_portal.* TO 'portal_user'@'localhost';
  FLUSH PRIVILEGES;
  ```
  Then update connection string with new credentials

### Issue 3: Database Not Found

**Error**: `Unknown database 'internship_job_portal'`

**Solution**:
- Run the `schema.sql` file to create the database
- Or manually create database:
  ```sql
  CREATE DATABASE internship_job_portal;
  ```
  Then run schema.sql

### Issue 4: Table Already Exists

**Error**: `Table 'users' already exists`

**Solution**:
- Drop the existing database:
  ```sql
  DROP DATABASE IF EXISTS internship_job_portal;
  ```
- Run `schema.sql` again

### Issue 5: Port Already in Use

**Error**: `Failed to bind to address http://localhost:5000`

**Solution**:
- Kill the process using the port
- Or change the port in `appsettings.json`:
  ```json
  "Urls": "http://localhost:5001"
  ```

### Issue 6: Pomelo.EntityFrameworkCore.MySql Error

**Error**: `Could not load file or assembly 'Pomelo.EntityFrameworkCore.MySql'`

**Solution**:
```bash
dotnet restore
dotnet clean
dotnet build
```

## Testing API Endpoints

### 1. Health Check
```bash
GET http://localhost:5000/api/health
```

### 2. Register Student
```bash
POST http://localhost:5000/api/auth/register/student
Content-Type: application/json

{
  "email": "student@test.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 3. Register Employer
```bash
POST http://localhost:5000/api/auth/register/employer
Content-Type: application/json

{
  "email": "employer@test.com",
  "password": "password123",
  "companyName": "Test Company"
}
```

### 4. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "student@test.com",
  "password": "password123"
}
```

### 5. Get Jobs
```bash
GET http://localhost:5000/api/jobs
```

## Next Steps

1. ✅ Database created and connected
2. ✅ Backend API running
3. 🔄 Connect frontend to backend
4. 🔄 Test authentication flow
5. 🔄 Implement remaining APIs

## Configuration Files

- `appsettings.json` - Application configuration
- `appsettings.Development.json` - Development settings (optional)

## Environment Variables (Optional)

You can also use environment variables instead of appsettings.json:

```bash
# Windows PowerShell
$env:ConnectionStrings__DefaultConnection="Server=localhost;Database=internship_job_portal;User=root;Password=your_password;Port=3306;"

# Windows CMD
set ConnectionStrings__DefaultConnection=Server=localhost;Database=internship_job_portal;User=root;Password=your_password;Port=3306;
```

---

**Note**: Agar koi problem aaye to MySQL logs check karo ya supervisor se help lo.

