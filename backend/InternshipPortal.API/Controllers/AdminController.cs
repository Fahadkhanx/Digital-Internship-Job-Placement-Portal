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
    }

    public class RejectEmployerRequest
    {
        public string? Reason { get; set; }
    }
}

