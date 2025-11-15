using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetJobs([FromQuery] string? search, [FromQuery] string? jobType, [FromQuery] string? location, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var query = _context.JobPostings
                .Include(j => j.Employer)
                .ThenInclude(e => e.User)
                .Where(j => j.IsActive && j.Employer.VerificationStatus == VerificationStatus.Verified);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(j => j.Title.Contains(search) || j.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(jobType))
            {
                if (Enum.TryParse<JobType>(jobType, true, out var type))
                {
                    query = query.Where(j => j.JobType == type);
                }
            }

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(j => (j.Location != null && j.Location.Contains(location)) || j.RemoteOption);
            }

            var total = await query.CountAsync();
            var jobs = await query
                .OrderByDescending(j => j.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(j => new
                {
                    j.JobId,
                    j.Title,
                    j.Description,
                    j.JobType,
                    j.Location,
                    j.RemoteOption,
                    j.SalaryMin,
                    j.SalaryMax,
                    j.Currency,
                    j.RequiredSkills,
                    j.ExperienceLevel,
                    j.CreatedAt,
                    CompanyName = j.Employer.CompanyName,
                    CompanyLogo = j.Employer.LogoUrl
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                jobs,
                pagination = new
                {
                    page,
                    limit,
                    total,
                    pages = (int)Math.Ceiling(total / (double)limit)
                }
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJob(int id)
        {
            var job = await _context.JobPostings
                .Include(j => j.Employer)
                .Where(j => j.JobId == id && j.IsActive)
                .Select(j => new
                {
                    j.JobId,
                    j.Title,
                    j.Description,
                    j.JobType,
                    j.Location,
                    j.RemoteOption,
                    j.SalaryMin,
                    j.SalaryMax,
                    j.Currency,
                    j.RequiredSkills,
                    j.RequiredEducation,
                    j.ExperienceLevel,
                    j.ApplicationDeadline,
                    j.CreatedAt,
                    CompanyName = j.Employer.CompanyName,
                    CompanyDescription = j.Employer.CompanyDescription,
                    CompanyLogo = j.Employer.LogoUrl,
                    CompanyWebsite = j.Employer.Website
                })
                .FirstOrDefaultAsync();

            if (job == null)
            {
                return NotFound(new { success = false, message = "Job not found" });
            }

            return Ok(new { success = true, job });
        }

        [Authorize(Roles = "Employer")]
        [HttpPost]
        public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var employer = await _context.Employers
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employer == null || employer.VerificationStatus != VerificationStatus.Verified)
            {
                return Forbid("Employer account must be verified to post jobs");
            }

            var job = new JobPosting
            {
                EmployerId = employer.EmployerId,
                Title = request.Title,
                Description = request.Description,
                JobType = request.JobType,
                Location = request.Location,
                RemoteOption = request.RemoteOption,
                SalaryMin = request.SalaryMin,
                SalaryMax = request.SalaryMax,
                Currency = request.Currency ?? "USD",
                RequiredSkills = request.RequiredSkills,
                RequiredEducation = request.RequiredEducation,
                ExperienceLevel = request.ExperienceLevel,
                ApplicationDeadline = request.ApplicationDeadline
            };

            _context.JobPostings.Add(job);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJob), new { id = job.JobId }, new { success = true, message = "Job posted successfully", jobId = job.JobId });
        }
    }

    public class CreateJobRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public JobType JobType { get; set; }
        public string? Location { get; set; }
        public bool RemoteOption { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string? Currency { get; set; }
        public string? RequiredSkills { get; set; }
        public string? RequiredEducation { get; set; }
        public ExperienceLevel ExperienceLevel { get; set; }
        public DateTime? ApplicationDeadline { get; set; }
    }
}

