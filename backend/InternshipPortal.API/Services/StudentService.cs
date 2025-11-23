using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace InternshipPortal.API.Services
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public StudentService(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<Student?> GetStudentProfileAsync(int userId)
        {
            return await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<Student> UpdateStudentProfileAsync(int userId, UpdateStudentProfileRequest request)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            
            if (student == null)
            {
                throw new Exception("Student profile not found. Please complete your registration first.");
            }

            // Update required fields (FirstName and LastName are required in model)
            if (!string.IsNullOrWhiteSpace(request.FirstName))
                student.FirstName = request.FirstName.Trim();
            else if (request.FirstName != null)
                throw new Exception("First Name is required");

            if (!string.IsNullOrWhiteSpace(request.LastName))
                student.LastName = request.LastName.Trim();
            else if (request.LastName != null)
                throw new Exception("Last Name is required");

            // Update optional fields
            if (request.Phone != null)
                student.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
            
            if (request.DateOfBirth.HasValue)
                student.DateOfBirth = request.DateOfBirth.Value;
            // If DateOfBirth is explicitly set to null, keep existing value (don't clear it)
            
            if (request.Address != null)
                student.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();
            
            if (request.City != null)
                student.City = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim();
            
            if (request.Country != null)
                student.Country = string.IsNullOrWhiteSpace(request.Country) ? null : request.Country.Trim();
            
            if (request.Bio != null)
                student.Bio = string.IsNullOrWhiteSpace(request.Bio) ? null : request.Bio.Trim();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to save profile: {ex.Message}");
            }

            return student;
        }

        public async Task<Education> AddEducationAsync(int userId, AddEducationRequest request)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var education = new Education
            {
                StudentId = student.StudentId,
                InstitutionName = request.InstitutionName,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Gpa = request.Gpa,
                Description = request.Description
            };

            _context.Education.Add(education);
            await _context.SaveChangesAsync();
            return education;
        }

        public async Task<bool> UpdateEducationAsync(int educationId, int userId, UpdateEducationRequest request)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var education = await _context.Education
                .FirstOrDefaultAsync(e => e.EducationId == educationId && e.StudentId == student.StudentId);

            if (education == null)
            {
                return false;
            }

            if (!string.IsNullOrEmpty(request.InstitutionName))
                education.InstitutionName = request.InstitutionName;
            if (!string.IsNullOrEmpty(request.Degree))
                education.Degree = request.Degree;
            if (request.FieldOfStudy != null)
                education.FieldOfStudy = request.FieldOfStudy;
            if (request.StartDate.HasValue)
                education.StartDate = request.StartDate;
            if (request.EndDate.HasValue)
                education.EndDate = request.EndDate;
            if (request.Gpa.HasValue)
                education.Gpa = request.Gpa;
            if (request.Description != null)
                education.Description = request.Description;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteEducationAsync(int educationId, int userId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var education = await _context.Education
                .FirstOrDefaultAsync(e => e.EducationId == educationId && e.StudentId == student.StudentId);

            if (education == null)
            {
                return false;
            }

            _context.Education.Remove(education);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Education>> GetEducationsAsync(int userId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return new List<Education>();
            }

            return await _context.Education
                .Where(e => e.StudentId == student.StudentId)
                .OrderByDescending(e => e.EndDate)
                .ToListAsync();
        }

        public async Task<StudentSkill> AddSkillAsync(int userId, AddSkillRequest request)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var skill = new StudentSkill
            {
                StudentId = student.StudentId,
                SkillName = request.SkillName,
                ProficiencyLevel = request.ProficiencyLevel
            };

            _context.StudentSkills.Add(skill);
            await _context.SaveChangesAsync();
            return skill;
        }

        public async Task<bool> UpdateSkillAsync(int skillId, int userId, UpdateSkillRequest request)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var skill = await _context.StudentSkills
                .FirstOrDefaultAsync(s => s.SkillId == skillId && s.StudentId == student.StudentId);

            if (skill == null)
            {
                return false;
            }

            if (!string.IsNullOrEmpty(request.SkillName))
                skill.SkillName = request.SkillName;
            if (request.ProficiencyLevel.HasValue)
                skill.ProficiencyLevel = request.ProficiencyLevel.Value;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSkillAsync(int skillId, int userId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var skill = await _context.StudentSkills
                .FirstOrDefaultAsync(s => s.SkillId == skillId && s.StudentId == student.StudentId);

            if (skill == null)
            {
                return false;
            }

            _context.StudentSkills.Remove(skill);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<StudentSkill>> GetSkillsAsync(int userId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return new List<StudentSkill>();
            }

            return await _context.StudentSkills
                .Where(s => s.StudentId == student.StudentId)
                .OrderBy(s => s.SkillName)
                .ToListAsync();
        }

        public async Task<string> UploadResumeAsync(int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new Exception("File is required");
            }

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception("Only PDF, DOC, and DOCX files are allowed");
            }

            if (file.Length > 5 * 1024 * 1024) // 5MB limit
            {
                throw new Exception("File size must be less than 5MB");
            }

            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "resumes");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"resume_{student.StudentId}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/resumes/{fileName}";
            student.ResumeUrl = fileUrl;
            await _context.SaveChangesAsync();

            return fileUrl;
        }

        public async Task<string> UploadProfilePictureAsync(int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new Exception("File is required");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception("Only JPG, JPEG, PNG, and GIF files are allowed");
            }

            if (file.Length > 2 * 1024 * 1024) // 2MB limit
            {
                throw new Exception("File size must be less than 2MB");
            }

            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "profiles");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"profile_{student.StudentId}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/profiles/{fileName}";
            student.ProfilePictureUrl = fileUrl;
            await _context.SaveChangesAsync();

            return fileUrl;
        }
    }
}
