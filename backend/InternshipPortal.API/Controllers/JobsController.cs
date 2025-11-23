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
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .SelectMany(x => x.Value.Errors.Select(e => $"{x.Key}: {e.ErrorMessage}"))
                        .ToList();
                    return BadRequest(new { success = false, message = "Validation failed", errors });
                }

                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Request body is required" });
                }

                if (string.IsNullOrWhiteSpace(request.Title))
                {
                    return BadRequest(new { success = false, message = "Job title is required" });
                }

                if (string.IsNullOrWhiteSpace(request.Description))
                {
                    return BadRequest(new { success = false, message = "Job description is required" });
                }

                // Parse and validate JobType enum
                if (string.IsNullOrWhiteSpace(request.JobType))
                {
                    return BadRequest(new { success = false, message = "Job type is required" });
                }

                if (!Enum.TryParse<JobType>(request.JobType, true, out var jobType))
                {
                    return BadRequest(new { success = false, message = $"Invalid job type '{request.JobType}'. Valid values are: {string.Join(", ", Enum.GetNames(typeof(JobType)))}" });
                }

                // Parse and validate ExperienceLevel enum
                if (string.IsNullOrWhiteSpace(request.ExperienceLevel))
                {
                    return BadRequest(new { success = false, message = "Experience level is required" });
                }

                if (!Enum.TryParse<ExperienceLevel>(request.ExperienceLevel, true, out var experienceLevel))
                {
                    return BadRequest(new { success = false, message = $"Invalid experience level '{request.ExperienceLevel}'. Valid values are: {string.Join(", ", Enum.GetNames(typeof(ExperienceLevel)))}" });
                }

                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

                var employer = await _context.Employers
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employer == null)
                {
                    return NotFound(new { success = false, message = "Employer profile not found. Please complete your registration first." });
                }

                if (employer.VerificationStatus != VerificationStatus.Verified)
                {
                    return BadRequest(new { success = false, message = "Your employer account must be verified to post jobs. Please contact the administrator." });
                }

                var job = new JobPosting
                {
                    EmployerId = employer.EmployerId,
                    Title = request.Title.Trim(),
                    Description = request.Description.Trim(),
                    JobType = jobType, // Use parsed enum value
                    Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim(),
                    RemoteOption = request.RemoteOption,
                    SalaryMin = request.SalaryMin,
                    SalaryMax = request.SalaryMax,
                    Currency = string.IsNullOrWhiteSpace(request.Currency) ? "USD" : request.Currency.Trim(),
                    RequiredSkills = string.IsNullOrWhiteSpace(request.RequiredSkills) ? null : request.RequiredSkills.Trim(),
                    RequiredEducation = string.IsNullOrWhiteSpace(request.RequiredEducation) ? null : request.RequiredEducation.Trim(),
                    ExperienceLevel = experienceLevel, // Use parsed enum value
                    ApplicationDeadline = request.ApplicationDeadline
                };

                _context.JobPostings.Add(job);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetJob), new { id = job.JobId }, new { success = true, message = "Job posted successfully", jobId = job.JobId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while creating the job", details = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [Authorize(Roles = "Employer")]
        [HttpGet("my-jobs")]
        public async Task<IActionResult> GetMyJobs()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);

            if (employer == null)
            {
                return NotFound(new { success = false, message = "Employer not found" });
            }

            var jobs = await _context.JobPostings
                .Where(j => j.EmployerId == employer.EmployerId)
                .OrderByDescending(j => j.CreatedAt)
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
                    j.ExperienceLevel,
                    j.IsActive,
                    j.CreatedAt,
                    j.UpdatedAt,
                    ApplicationCount = _context.Applications.Count(a => a.JobId == j.JobId)
                })
                .ToListAsync();

            return Ok(new { success = true, jobs });
        }

        [Authorize(Roles = "Employer")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJob(int id, [FromBody] UpdateJobRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);

            if (employer == null)
            {
                return NotFound(new { success = false, message = "Employer not found" });
            }

            var job = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobId == id && j.EmployerId == employer.EmployerId);

            if (job == null)
            {
                return NotFound(new { success = false, message = "Job not found" });
            }

            if (!string.IsNullOrEmpty(request.Title))
                job.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Description))
                job.Description = request.Description;
            if (request.JobType.HasValue)
                job.JobType = request.JobType.Value;
            if (request.Location != null)
                job.Location = request.Location;
            job.RemoteOption = request.RemoteOption;
            if (request.SalaryMin.HasValue)
                job.SalaryMin = request.SalaryMin;
            if (request.SalaryMax.HasValue)
                job.SalaryMax = request.SalaryMax;
            if (!string.IsNullOrEmpty(request.Currency))
                job.Currency = request.Currency;
            if (request.RequiredSkills != null)
                job.RequiredSkills = request.RequiredSkills;
            if (request.RequiredEducation != null)
                job.RequiredEducation = request.RequiredEducation;
            if (request.ExperienceLevel.HasValue)
                job.ExperienceLevel = request.ExperienceLevel.Value;
            if (request.ApplicationDeadline.HasValue)
                job.ApplicationDeadline = request.ApplicationDeadline;
            if (request.IsActive.HasValue)
                job.IsActive = request.IsActive.Value;
            job.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Job updated successfully", job });
        }

        [Authorize(Roles = "Employer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);

            if (employer == null)
            {
                return NotFound(new { success = false, message = "Employer not found" });
            }

            var job = await _context.JobPostings
                .FirstOrDefaultAsync(j => j.JobId == id && j.EmployerId == employer.EmployerId);

            if (job == null)
            {
                return NotFound(new { success = false, message = "Job not found" });
            }

            _context.JobPostings.Remove(job);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Job deleted successfully" });
        }
    }

    public class UpdateJobRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public JobType? JobType { get; set; }
        public string? Location { get; set; }
        public bool RemoteOption { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string? Currency { get; set; }
        public string? RequiredSkills { get; set; }
        public string? RequiredEducation { get; set; }
        public ExperienceLevel? ExperienceLevel { get; set; }
        public DateTime? ApplicationDeadline { get; set; }
        public bool? IsActive { get; set; }
    }

    public class CreateJobRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty; // Accept as string, parse to enum
        public string? Location { get; set; }
        public bool RemoteOption { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string? Currency { get; set; }
        public string? RequiredSkills { get; set; }
        public string? RequiredEducation { get; set; }
        public string ExperienceLevel { get; set; } = string.Empty; // Accept as string, parse to enum
        public DateTime? ApplicationDeadline { get; set; }
    }
}

