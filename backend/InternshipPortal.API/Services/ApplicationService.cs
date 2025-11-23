using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPortal.API.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly ApplicationDbContext _context;

        public ApplicationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Application> ApplyForJobAsync(int userId, int jobId, string? coverLetter)
        {
            // Check if student exists
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found. Please complete your profile first.");
            }

            // Check if job exists and is active
            var job = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobId == jobId && j.IsActive);
            if (job == null)
            {
                throw new Exception("Job not found or no longer available");
            }

            // Check if already applied
            var existingApplication = await _context.Applications
                .FirstOrDefaultAsync(a => a.JobId == jobId && a.StudentId == student.StudentId);

            if (existingApplication != null)
            {
                throw new Exception("You have already applied for this job");
            }

            // Create application
            var application = new Application
            {
                JobId = jobId,
                StudentId = student.StudentId,
                CoverLetter = coverLetter,
                Status = ApplicationStatus.Pending,
                AppliedAt = DateTime.UtcNow
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return application;
        }

        public async Task<List<Application>> GetStudentApplicationsAsync(int userId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return new List<Application>();
            }

            return await _context.Applications
                .Include(a => a.Job)
                    .ThenInclude(j => j.Employer)
                .Where(a => a.StudentId == student.StudentId)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();
        }

        public async Task<List<Application>> GetJobApplicationsAsync(int employerUserId, int jobId)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId);
            if (employer == null)
            {
                throw new Exception("Employer not found");
            }

            var job = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobId == jobId && j.EmployerId == employer.EmployerId);
            if (job == null)
            {
                throw new Exception("Job not found");
            }

            return await _context.Applications
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .Where(a => a.JobId == jobId)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();
        }

        public async Task<bool> HasAppliedAsync(int userId, int jobId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return false;
            }

            return await _context.Applications
                .AnyAsync(a => a.JobId == jobId && a.StudentId == student.StudentId);
        }

        public async Task<Application?> GetApplicationAsync(int applicationId, int userId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return null;
            }

            return await _context.Applications
                .Include(a => a.Job)
                    .ThenInclude(j => j.Employer)
                .FirstOrDefaultAsync(a => a.ApplicationId == applicationId && a.StudentId == student.StudentId);
        }

        public async Task<Application> UpdateApplicationStatusAsync(int employerUserId, int applicationId, ApplicationStatus status)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId);
            if (employer == null)
            {
                throw new Exception("Employer not found");
            }

            var application = await _context.Applications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.ApplicationId == applicationId);

            if (application == null)
            {
                throw new Exception("Application not found");
            }

            // Verify that the job belongs to this employer
            if (application.Job.EmployerId != employer.EmployerId)
            {
                throw new Exception("You don't have permission to update this application");
            }

            application.Status = status;
            application.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return application;
        }
    }
}
