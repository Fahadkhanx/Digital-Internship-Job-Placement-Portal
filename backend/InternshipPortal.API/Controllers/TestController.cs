using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            try
            {
                var password = request.Password ?? "Admin@123";
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

                // Check if admin already exists
                var existingAdmin = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == "admin@portal.com");

                if (existingAdmin != null)
                {
                    // Update password and ensure admin settings
                    existingAdmin.PasswordHash = passwordHash;
                    existingAdmin.UserType = UserType.Admin;
                    existingAdmin.IsVerified = true;
                    existingAdmin.IsActive = true;
                    await _context.SaveChangesAsync();
                    
                    return Ok(new { 
                        success = true, 
                        message = "Admin password updated successfully",
                        email = "admin@portal.com",
                        password = password,
                        note = "Use these credentials to login"
                    });
                }

                // Create new admin
                var admin = new User
                {
                    Email = "admin@portal.com",
                    PasswordHash = passwordHash,
                    UserType = UserType.Admin,
                    IsVerified = true,
                    IsActive = true
                };

                _context.Users.Add(admin);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = "Admin user created successfully", 
                    userId = admin.UserId,
                    email = "admin@portal.com",
                    password = password,
                    note = "Use these credentials to login"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("check-admin")]
        public async Task<IActionResult> CheckAdmin()
        {
            try
            {
                var admin = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == "admin@portal.com");

                if (admin == null)
                {
                    return Ok(new { 
                        exists = false, 
                        message = "Admin user does not exist. Use /api/test/create-admin to create one." 
                    });
                }

                return Ok(new { 
                    exists = true,
                    userId = admin.UserId,
                    email = admin.Email,
                    userType = admin.UserType.ToString(),
                    isVerified = admin.IsVerified,
                    isActive = admin.IsActive,
                    message = "Admin user exists. Password hash is set."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                var userCount = await _context.Users.CountAsync();

                return Ok(new
                {
                    success = true,
                    databaseConnected = canConnect,
                    userCount = userCount,
                    message = "Database connection successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }

    public class CreateAdminRequest
    {
        public string Password { get; set; } = "Admin@123";
    }
}

