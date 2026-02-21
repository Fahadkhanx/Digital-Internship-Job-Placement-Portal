using System.Net;
using System.Net.Mail;
using System.Text;

namespace InternshipPortal.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var smtpHost = smtpSettings["Host"];
                var smtpPort = int.Parse(smtpSettings["Port"] ?? "587");
                var smtpUsername = smtpSettings["Username"];
                var smtpPassword = smtpSettings["Password"];
                var fromEmail = smtpSettings["FromEmail"];
                var fromName = smtpSettings["FromName"] ?? "Internship Portal";

                // If SMTP is not configured, log and return false
                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername))
                {
                    _logger.LogWarning("SMTP settings not configured. Email not sent to {Email}", to);
                    return false;
                }

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword)
                };

                using var message = new MailMessage
                {
                    From = new MailAddress(fromEmail ?? smtpUsername, fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml,
                    BodyEncoding = Encoding.UTF8,
                    SubjectEncoding = Encoding.UTF8
                };

                message.To.Add(to);

                await client.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to {Email}", to);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {Email}", to);
                return false;
            }
        }

        public async Task<bool> SendPasswordResetEmailAsync(string email, string resetToken)
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?token={resetToken}";

            var subject = "Password Reset Request - Internship Portal";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #3498db;'>Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>You have requested to reset your password for your Internship Portal account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{resetLink}' 
                               style='background-color: #3498db; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;'>
                                Reset Password
                            </a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style='word-break: break-all; color: #3498db;'>{resetLink}</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you did not request a password reset, please ignore this email.</p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='font-size: 12px; color: #7f8c8d;'>
                            This is an automated email. Please do not reply.
                        </p>
                    </div>
                </body>
                </html>";

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendNotificationEmailAsync(string email, string title, string message, string? link = null)
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var linkHtml = string.IsNullOrEmpty(link) 
                ? "" 
                : $@"
                    <div style='text-align: center; margin: 20px 0;'>
                        <a href='{frontendUrl}{link}' 
                           style='background-color: #3498db; color: white; padding: 10px 25px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;'>
                            View Details
                        </a>
                    </div>";

            var subject = $"{title} - Internship Portal";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #3498db;'>{title}</h2>
                        <p>{message}</p>
                        {linkHtml}
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='font-size: 12px; color: #7f8c8d;'>
                            This is an automated email from Internship Portal.
                        </p>
                    </div>
                </body>
                </html>";

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendVerificationCodeEmailAsync(string email, string verificationCode)
        {
            var subject = "Email Verification Code - Internship Portal";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #3498db;'>Email Verification</h2>
                        <p>Hello,</p>
                        <p>Thank you for registering with Internship Portal!</p>
                        <p>Please use the following verification code to activate your account:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <div style='background-color: #f8f9fa; border: 2px solid #3498db; 
                                        border-radius: 8px; padding: 20px; display: inline-block;'>
                                <h1 style='color: #3498db; margin: 0; font-size: 36px; letter-spacing: 5px;'>
                                    {verificationCode}
                                </h1>
                            </div>
                        </div>
                        <p><strong>This code will expire in 10 minutes.</strong></p>
                        <p>If you did not create an account, please ignore this email.</p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='font-size: 12px; color: #7f8c8d;'>
                            This is an automated email. Please do not reply.
                        </p>
                    </div>
                </body>
                </html>";

            return await SendEmailAsync(email, subject, body);
        }
    }
}

