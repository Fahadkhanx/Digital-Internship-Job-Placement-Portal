using BCrypt.Net;
using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InternshipPortal.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        private string GenerateVerificationCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // 6-digit code
        }

        public async Task<RegisterResult> RegisterStudentAsync(string email, string password, string firstName, string lastName)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                throw new Exception("Email already registered");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            var verificationCode = GenerateVerificationCode();

            var user = new User
            {
                Email = email,
                PasswordHash = passwordHash,
                UserType = UserType.Student,
                IsVerified = false,
                IsActive = true,
                VerificationCode = verificationCode,
                VerificationCodeExpiresAt = DateTime.UtcNow.AddMinutes(10),
                VerificationAttempts = 0,
                ResendCodeAttempts = 0
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var student = new Student
            {
                UserId = user.UserId,
                FirstName = firstName,
                LastName = lastName
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            // Send verification code email
            await _emailService.SendVerificationCodeEmailAsync(email, verificationCode);

            return new RegisterResult
            {
                Success = true,
                Message = "Registration successful! Please check your email for verification code.",
                UserId = user.UserId,
                Email = email
            };
        }

        public async Task<RegisterResult> RegisterEmployerAsync(string email, string password, string companyName)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                throw new Exception("Email already registered");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            var verificationCode = GenerateVerificationCode();

            var user = new User
            {
                Email = email,
                PasswordHash = passwordHash,
                UserType = UserType.Employer,
                IsVerified = false,
                IsActive = true,
                VerificationCode = verificationCode,
                VerificationCodeExpiresAt = DateTime.UtcNow.AddMinutes(10),
                VerificationAttempts = 0,
                ResendCodeAttempts = 0
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var employer = new Employer
            {
                UserId = user.UserId,
                CompanyName = companyName,
                VerificationStatus = VerificationStatus.Pending
            };

            _context.Employers.Add(employer);
            await _context.SaveChangesAsync();

            // Send verification code email
            await _emailService.SendVerificationCodeEmailAsync(email, verificationCode);

            return new RegisterResult
            {
                Success = true,
                Message = "Registration successful! Please check your email for verification code.",
                UserId = user.UserId,
                Email = email
            };
        }

        public async Task<LoginResult> LoginAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new Exception("Invalid email or password");
            }

            // Verify password
            bool isPasswordValid = false;
            try
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            }
            catch
            {
                // Password hash might be invalid format
                isPasswordValid = false;
            }

            if (!isPasswordValid)
            {
                throw new Exception("Invalid email or password");
            }

            if (!user.IsActive)
            {
                throw new Exception("Account is deactivated");
            }

            // Check if email is verified
            if (!user.IsVerified)
            {
                throw new Exception("Please verify your email before logging in. Check your email for verification code.");
            }

            var token = GenerateJwtToken(user);

            return new LoginResult
            {
                Token = token,
                UserId = user.UserId,
                Email = user.Email,
                UserType = user.UserType.ToString(),
                IsVerified = user.IsVerified
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null || !BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RequestPasswordResetAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null)
            {
                // Don't reveal if email exists or not (security best practice)
                return true;
            }

            // Invalidate any existing reset tokens for this user
            var existingTokens = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.UserId && !t.Used && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();
            
            foreach (var token in existingTokens)
            {
                token.Used = true;
            }

            // Generate new reset token
            var resetToken = Guid.NewGuid().ToString() + Guid.NewGuid().ToString();
            var tokenEntity = new PasswordResetToken
            {
                UserId = user.UserId,
                Token = resetToken,
                ExpiresAt = DateTime.UtcNow.AddHours(24), // Token valid for 24 hours
                Used = false
            };

            _context.PasswordResetTokens.Add(tokenEntity);
            await _context.SaveChangesAsync();

            // Send email with reset link
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken);

            return true;
        }

        public async Task<bool> VerifyResetTokenAsync(string token)
        {
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow);

            return resetToken != null;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var resetToken = await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow);

            if (resetToken == null || resetToken.User == null)
            {
                return false;
            }

            // Update password
            resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            
            // Mark token as used
            resetToken.Used = true;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> VerifyEmailCodeAsync(string email, string code)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            // Check if user is already verified
            if (user.IsVerified)
            {
                return true;
            }

            // Check if verification code exists and is not expired
            if (string.IsNullOrEmpty(user.VerificationCode) || 
                user.VerificationCodeExpiresAt == null || 
                user.VerificationCodeExpiresAt < DateTime.UtcNow)
            {
                throw new Exception("Verification code has expired. Please request a new code.");
            }

            // Check verification attempts (3 wrong attempts = 5 min cooldown)
            if (user.VerificationAttempts >= 3)
            {
                if (user.LastVerificationAttemptAt != null && 
                    user.LastVerificationAttemptAt.Value.AddMinutes(5) > DateTime.UtcNow)
                {
                    var remainingMinutes = (int)Math.Ceiling((user.LastVerificationAttemptAt.Value.AddMinutes(5) - DateTime.UtcNow).TotalMinutes);
                    throw new Exception($"Too many failed attempts. Please wait {remainingMinutes} minute(s) before trying again.");
                }
                else
                {
                    // Reset attempts after cooldown period
                    user.VerificationAttempts = 0;
                    user.LastVerificationAttemptAt = null;
                }
            }

            // Verify code
            if (user.VerificationCode != code)
            {
                user.VerificationAttempts++;
                user.LastVerificationAttemptAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                throw new Exception($"Invalid verification code. {3 - user.VerificationAttempts} attempt(s) remaining.");
            }

            // Code is correct - verify user
            user.IsVerified = true;
            user.VerificationCode = null;
            user.VerificationCodeExpiresAt = null;
            user.VerificationAttempts = 0;
            user.LastVerificationAttemptAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ResendVerificationCodeAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            // Check if user is already verified
            if (user.IsVerified)
            {
                throw new Exception("Email is already verified");
            }

            // Check resend attempts limit (3 attempts max)
            if (user.ResendCodeAttempts >= 3)
            {
                // Check if 5 minutes have passed since last resend
                if (user.LastResendCodeAt != null && 
                    user.LastResendCodeAt.Value.AddMinutes(5) > DateTime.UtcNow)
                {
                    var remainingMinutes = (int)Math.Ceiling((user.LastResendCodeAt.Value.AddMinutes(5) - DateTime.UtcNow).TotalMinutes);
                    throw new Exception($"Too many resend requests. Please wait {remainingMinutes} minute(s) before requesting a new code.");
                }
                else
                {
                    // Reset attempts after cooldown period
                    user.ResendCodeAttempts = 0;
                    user.LastResendCodeAt = null;
                }
            }

            // Generate new verification code
            var verificationCode = GenerateVerificationCode();
            user.VerificationCode = verificationCode;
            user.VerificationCodeExpiresAt = DateTime.UtcNow.AddMinutes(10);
            user.ResendCodeAttempts++;
            user.LastResendCodeAt = DateTime.UtcNow;
            user.VerificationAttempts = 0; // Reset verification attempts when resending
            user.LastVerificationAttemptAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send verification code email
            await _emailService.SendVerificationCodeEmailAsync(email, verificationCode);

            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.UserType.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
