using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IStudentService
    {
        Task<Student?> GetStudentProfileAsync(int userId);
        Task<Student> UpdateStudentProfileAsync(int userId, UpdateStudentProfileRequest request);
        Task<Education> AddEducationAsync(int userId, AddEducationRequest request);
        Task<bool> UpdateEducationAsync(int educationId, int userId, UpdateEducationRequest request);
        Task<bool> DeleteEducationAsync(int educationId, int userId);
        Task<List<Education>> GetEducationsAsync(int userId);
        Task<StudentSkill> AddSkillAsync(int userId, AddSkillRequest request);
        Task<bool> UpdateSkillAsync(int skillId, int userId, UpdateSkillRequest request);
        Task<bool> DeleteSkillAsync(int skillId, int userId);
        Task<List<StudentSkill>> GetSkillsAsync(int userId);
        Task<string> UploadResumeAsync(int userId, IFormFile file);
        Task<string> UploadProfilePictureAsync(int userId, IFormFile file);
    }

    public class UpdateStudentProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Bio { get; set; }
    }

    public class AddEducationRequest
    {
        public string InstitutionName { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
        public string? FieldOfStudy { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Gpa { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateEducationRequest
    {
        public string? InstitutionName { get; set; }
        public string? Degree { get; set; }
        public string? FieldOfStudy { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Gpa { get; set; }
        public string? Description { get; set; }
    }

    public class AddSkillRequest
    {
        public string SkillName { get; set; } = string.Empty;
        public ProficiencyLevel ProficiencyLevel { get; set; } = ProficiencyLevel.Beginner;
    }

    public class UpdateSkillRequest
    {
        public string? SkillName { get; set; }
        public ProficiencyLevel? ProficiencyLevel { get; set; }
    }
}
