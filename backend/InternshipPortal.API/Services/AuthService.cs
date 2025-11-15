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

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> RegisterStudentAsync(string email, string password, string firstName, string lastName)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                throw new Exception("Email already registered");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            var user = new User
            {
                Email = email,
                PasswordHash = passwordHash,
                UserType = UserType.Student,
                IsVerified = false,
                IsActive = true
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

            return GenerateJwtToken(user);
        }

        public async Task<string> RegisterEmployerAsync(string email, string password, string companyName)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                throw new Exception("Email already registered");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            var user = new User
            {
                Email = email,
                PasswordHash = passwordHash,
                UserType = UserType.Employer,
                IsVerified = false,
                IsActive = true
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

            return "Employer registered successfully. Pending verification.";
        }

        public async Task<string> LoginAsync(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                throw new Exception("Invalid email or password");
            }

            if (!user.IsActive)
            {
                throw new Exception("Account is deactivated");
            }

            return GenerateJwtToken(user);
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
