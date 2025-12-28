namespace InternshipPortal.API.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task<bool> SendPasswordResetEmailAsync(string email, string resetToken);
        Task<bool> SendNotificationEmailAsync(string email, string title, string message, string? link = null);
    }
}

