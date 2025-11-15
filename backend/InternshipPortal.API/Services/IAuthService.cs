using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IAuthService
    {
        Task<string> RegisterStudentAsync(string email, string password, string firstName, string lastName);
        Task<string> RegisterEmployerAsync(string email, string password, string companyName);
        Task<string> LoginAsync(string email, string password);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    }
}
