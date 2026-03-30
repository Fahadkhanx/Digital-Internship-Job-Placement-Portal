using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IApplicationService
    {
        Task<Application> ApplyForJobAsync(int userId, int jobId, string? coverLetter);
        Task<List<Application>> GetStudentApplicationsAsync(int userId);
        Task<List<Application>> GetJobApplicationsAsync(int employerUserId, int jobId);
        Task<bool> HasAppliedAsync(int userId, int jobId);
        Task<Application?> GetApplicationAsync(int applicationId, int userId);
        Task<Application> UpdateApplicationStatusAsync(int employerUserId, int applicationId, ApplicationStatus status);
    }
}
