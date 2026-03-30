using InternshipPortal.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployersController : ControllerBase
    {
        private readonly IEmployerService _employerService;

        public EmployersController(IEmployerService employerService)
        {
            _employerService = employerService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetUserId();
                var employer = await _employerService.GetEmployerProfileAsync(userId);
                
                if (employer == null)
                {
                    return NotFound(new { success = false, message = "Employer profile not found" });
                }

                return Ok(new { success = true, employer });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateEmployerProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var employer = await _employerService.UpdateEmployerProfileAsync(userId, request);
                return Ok(new { success = true, message = "Profile updated successfully", employer });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("upload/logo")]
        public async Task<IActionResult> UploadLogo(IFormFile file)
        {
            try
            {
                var userId = GetUserId();
                var fileUrl = await _employerService.UploadLogoAsync(userId, file);
                return Ok(new { success = true, message = "Logo uploaded successfully", fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

