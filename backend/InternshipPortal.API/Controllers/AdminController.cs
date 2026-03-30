using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet("employers")]
        public async Task<IActionResult> GetAllEmployers([FromQuery] string? status)
        {
            try
            {
                var query = _context.Employers
                    .Include(e => e.User)
                    .AsQueryable();

                // Filter by verification status if provided
                if (!string.IsNullOrEmpty(status))
                {
                    if (Enum.TryParse<VerificationStatus>(status, true, out var verificationStatus))
                    {
                        query = query.Where(e => e.VerificationStatus == verificationStatus);
                    }
                }

                var employers = await query
                    .OrderByDescending(e => e.VerificationStatus == VerificationStatus.Pending)
                    .ThenByDescending(e => e.VerifiedAt)
                    .Select(e => new
                    {
                        e.EmployerId,
                        e.CompanyName,
                        e.Industry,
                        e.Website,
                        e.Phone,
                        e.City,
                        e.Country,
                        e.LogoUrl,
                        e.VerificationStatus,
                        e.VerifiedAt,
                        e.VerifiedBy,
                        UserEmail = e.User != null ? e.User.Email : null,
                        UserId = e.UserId,
                        CreatedAt = e.User != null ? e.User.CreatedAt : (DateTime?)null
                    })
                    .ToListAsync();

                return Ok(new { success = true, employers });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while fetching employers", details = ex.Message });
            }
        }

        [HttpGet("employers/{id}")]
        public async Task<IActionResult> GetEmployerDetails(int id)
        {
            try
            {
                var employer = await _context.Employers
                    .Include(e => e.User)
                    .Where(e => e.EmployerId == id)
                    .Select(e => new
                    {
                        e.EmployerId,
                        e.CompanyName,
                        e.CompanyDescription,
                        e.Industry,
                        e.Website,
                        e.Phone,
                        e.Address,
                        e.City,
                        e.Country,
                        e.LogoUrl,
                        e.VerificationStatus,
                        e.VerifiedAt,
                        e.VerifiedBy,
                        UserEmail = e.User != null ? e.User.Email : null,
                        UserId = e.UserId,
                        CreatedAt = e.User != null ? e.User.CreatedAt : (DateTime?)null
                    })
                    .FirstOrDefaultAsync();

                if (employer == null)
                {
                    return NotFound(new { success = false, message = "Employer not found" });
                }

                return Ok(new { success = true, employer });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while fetching employer details", details = ex.Message });
            }
        }

        [HttpPut("employers/{id}/verify")]
        public async Task<IActionResult> VerifyEmployer(int id)
        {
            try
            {
                var adminId = GetUserId();
                var employer = await _context.Employers
                    .FirstOrDefaultAsync(e => e.EmployerId == id);

                if (employer == null)
                {
                    return NotFound(new { success = false, message = "Employer not found" });
                }

                employer.VerificationStatus = VerificationStatus.Verified;
                employer.VerifiedBy = adminId;
                employer.VerifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Employer verified successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while verifying employer", details = ex.Message });
            }
        }

        [HttpPut("employers/{id}/reject")]
        public async Task<IActionResult> RejectEmployer(int id)
        {
            try
            {
                var adminId = GetUserId();
                var employer = await _context.Employers
                    .FirstOrDefaultAsync(e => e.EmployerId == id);

                if (employer == null)
                {
                    return NotFound(new { success = false, message = "Employer not found" });
                }

                employer.VerificationStatus = VerificationStatus.Rejected;
                employer.VerifiedBy = adminId;
                employer.VerifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Employer rejected successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while rejecting employer", details = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetAdminStats()
        {
            try
            {
                var totalEmployers = await _context.Employers.CountAsync();
                var pendingEmployers = await _context.Employers.CountAsync(e => e.VerificationStatus == VerificationStatus.Pending);
                var verifiedEmployers = await _context.Employers.CountAsync(e => e.VerificationStatus == VerificationStatus.Verified);
                var rejectedEmployers = await _context.Employers.CountAsync(e => e.VerificationStatus == VerificationStatus.Rejected);
                var totalStudents = await _context.Students.CountAsync();
                var totalJobs = await _context.JobPostings.CountAsync();
                var activeJobs = await _context.JobPostings.CountAsync(j => j.IsActive);

                return Ok(new
                {
                    success = true,
                    stats = new
                    {
                        totalEmployers,
                        pendingEmployers,
                        verifiedEmployers,
                        rejectedEmployers,
                        totalStudents,
                        totalJobs,
                        activeJobs
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while fetching stats", details = ex.Message });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? userType, [FromQuery] string? status)
        {
            try
            {
                var query = _context.Users.AsQueryable();

                // Filter by user type
                if (!string.IsNullOrEmpty(userType) && Enum.TryParse<UserType>(userType, true, out var type))
                {
                    query = query.Where(u => u.UserType == type);
                }

                // Filter by status
                if (!string.IsNullOrEmpty(status))
                {
                    switch (status.ToLower())
                    {
                        case "active":
                            query = query.Where(u => u.IsActive && !u.IsBanned);
                            break;
                        case "inactive":
                            query = query.Where(u => !u.IsActive);
                            break;
                        case "banned":
                            query = query.Where(u => u.IsBanned);
                            break;
                    }
                }

                var users = await query
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => new
                    {
                        u.UserId,
                        u.Email,
                        UserType = u.UserType.ToString(),
                        u.IsVerified,
                        u.IsActive,
                        u.IsBanned,
                        u.BannedUntil,
                        u.BanReason,
                        u.CreatedAt,
                        u.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new { success = true, users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while fetching users", details = ex.Message });
            }
        }

        [HttpPut("users/{id}/ban")]
        public async Task<IActionResult> BanUser(int id, [FromBody] BanUserRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Prevent banning admin users
                if (user.UserType == UserType.Admin)
                {
                    return BadRequest(new { success = false, message = "Cannot ban admin users" });
                }

                user.IsBanned = true;
                user.IsActive = false;

                if (request.Duration == "permanent")
                {
                    user.BannedUntil = null; // Permanent ban
                }
                else if (request.Duration == "3days")
                {
                    user.BannedUntil = DateTime.UtcNow.AddDays(3);
                }
                else
                {
                    return BadRequest(new { success = false, message = "Invalid duration. Use '3days' or 'permanent'" });
                }

                user.BanReason = request.Reason;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = $"User banned {(request.Duration == "permanent" ? "permanently" : "for 3 days")}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while banning user", details = ex.Message });
            }
        }

        [HttpPut("users/{id}/unban")]
        public async Task<IActionResult> UnbanUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                user.IsBanned = false;
                user.IsActive = true;
                user.BannedUntil = null;
                user.BanReason = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "User unbanned successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while unbanning user", details = ex.Message });
            }
        }

        [HttpPut("users/{id}/deactivate")]
        public async Task<IActionResult> DeactivateUser(int id, [FromBody] DeactivateUserRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Prevent deactivating admin users
                if (user.UserType == UserType.Admin)
                {
                    return BadRequest(new { success = false, message = "Cannot deactivate admin users" });
                }

                user.IsActive = false;

                if (request.Duration == "permanent")
                {
                    // Permanent deactivation
                }
                else if (request.Duration == "3days")
                {
                    // For 3 days - we can use BannedUntil field to track this
                    user.BannedUntil = DateTime.UtcNow.AddDays(3);
                }
                else
                {
                    return BadRequest(new { success = false, message = "Invalid duration. Use '3days' or 'permanent'" });
                }

                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = $"User deactivated {(request.Duration == "permanent" ? "permanently" : "for 3 days")}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while deactivating user", details = ex.Message });
            }
        }

        [HttpPut("users/{id}/activate")]
        public async Task<IActionResult> ActivateUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                user.IsActive = true;
                user.BannedUntil = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "User activated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while activating user", details = ex.Message });
            }
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeRoleRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                if (!Enum.TryParse<UserType>(request.UserType, true, out var newUserType))
                {
                    return BadRequest(new { success = false, message = "Invalid user type. Use 'Student', 'Employer', or 'Admin'" });
                }

                user.UserType = newUserType;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = $"User role changed to {newUserType}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while changing user role", details = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Prevent deleting admin users
                if (user.UserType == UserType.Admin)
                {
                    return BadRequest(new { success = false, message = "Cannot delete admin users" });
                }

                // Get current admin user ID
                var currentAdminId = GetUserId();
                
                // Prevent admin from deleting themselves
                if (user.UserId == currentAdminId)
                {
                    return BadRequest(new { success = false, message = "Cannot delete your own account" });
                }

                // Delete user (cascade delete will handle related records)
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while deleting user", details = ex.Message });
            }
        }
    }

    public class BanUserRequest
    {
        public string Duration { get; set; } = string.Empty; // "3days" or "permanent"
        public string? Reason { get; set; }
    }

    public class DeactivateUserRequest
    {
        public string Duration { get; set; } = string.Empty; // "3days" or "permanent"
        public string? Reason { get; set; }
    }

    public class ChangeRoleRequest
    {
        public string UserType { get; set; } = string.Empty; // "Student", "Employer", or "Admin"
    }

    public class RejectEmployerRequest
    {
        public string? Reason { get; set; }
    }
}

