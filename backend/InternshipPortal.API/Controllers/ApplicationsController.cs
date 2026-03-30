using InternshipPortal.API.Services;
using InternshipPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicationsController : ControllerBase
    {
        private readonly IApplicationService _applicationService;

        public ApplicationsController(IApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpPost("apply")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> ApplyForJob([FromBody] ApplyJobRequest request)
        {
            try
            {
                var userId = GetUserId();
                var application = await _applicationService.ApplyForJobAsync(userId, request.JobId, request.CoverLetter);
                return Ok(new { success = true, message = "Application submitted successfully", application });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("my-applications")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyApplications()
        {
            try
            {
                var userId = GetUserId();
                var applications = await _applicationService.GetStudentApplicationsAsync(userId);
                return Ok(new { success = true, applications });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("job/{jobId}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> GetJobApplications(int jobId)
        {
            try
            {
                var userId = GetUserId();
                var applications = await _applicationService.GetJobApplicationsAsync(userId, jobId);
                return Ok(new { success = true, applications });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("check/{jobId}")]
        public async Task<IActionResult> CheckApplication(int jobId)
        {
            try
            {
                var userId = GetUserId();
                var hasApplied = await _applicationService.HasAppliedAsync(userId, jobId);
                return Ok(new { success = true, hasApplied });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{applicationId}/status")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateApplicationStatus(int applicationId, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Status))
                {
                    return BadRequest(new { success = false, message = "Status is required" });
                }

                if (!Enum.TryParse<ApplicationStatus>(request.Status, true, out var status))
                {
                    return BadRequest(new { success = false, message = $"Invalid status. Valid values are: {string.Join(", ", Enum.GetNames(typeof(ApplicationStatus)))}" });
                }

                var userId = GetUserId();
                var application = await _applicationService.UpdateApplicationStatusAsync(userId, applicationId, status);
                return Ok(new { success = true, message = "Application status updated successfully", application });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public class ApplyJobRequest
    {
        public int JobId { get; set; }
        public string? CoverLetter { get; set; }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}

