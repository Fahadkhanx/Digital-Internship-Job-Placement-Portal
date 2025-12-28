using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IAuthService
    {
        Task<string> RegisterStudentAsync(string email, string password, string firstName, string lastName);
        Task<string> RegisterEmployerAsync(string email, string password, string companyName);
        Task<LoginResult> LoginAsync(string email, string password);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<bool> RequestPasswordResetAsync(string email);
        Task<bool> VerifyResetTokenAsync(string token);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
    }

    public class LoginResult
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
    }
}
