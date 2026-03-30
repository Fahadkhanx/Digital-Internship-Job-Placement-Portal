using InternshipPortal.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
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
                var student = await _studentService.GetStudentProfileAsync(userId);
                
                if (student == null)
                {
                    return NotFound(new { success = false, message = "Student profile not found" });
                }

                return Ok(new { success = true, student });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateStudentProfileRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Request body is required" });
                }

                var userId = GetUserId();
                var student = await _studentService.UpdateStudentProfileAsync(userId, request);
                return Ok(new { success = true, message = "Profile updated successfully", student });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpGet("education")]
        public async Task<IActionResult> GetEducations()
        {
            try
            {
                var userId = GetUserId();
                var educations = await _studentService.GetEducationsAsync(userId);
                return Ok(new { success = true, educations });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("education")]
        public async Task<IActionResult> AddEducation([FromBody] AddEducationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var education = await _studentService.AddEducationAsync(userId, request);
                return Ok(new { success = true, message = "Education added successfully", education });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("education/{educationId}")]
        public async Task<IActionResult> UpdateEducation(int educationId, [FromBody] UpdateEducationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _studentService.UpdateEducationAsync(educationId, userId, request);
                
                if (!success)
                {
                    return NotFound(new { success = false, message = "Education not found" });
                }

                return Ok(new { success = true, message = "Education updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("education/{educationId}")]
        public async Task<IActionResult> DeleteEducation(int educationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _studentService.DeleteEducationAsync(educationId, userId);
                
                if (!success)
                {
                    return NotFound(new { success = false, message = "Education not found" });
                }

                return Ok(new { success = true, message = "Education deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("skills")]
        public async Task<IActionResult> GetSkills()
        {
            try
            {
                var userId = GetUserId();
                var skills = await _studentService.GetSkillsAsync(userId);
                return Ok(new { success = true, skills });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("skills")]
        public async Task<IActionResult> AddSkill([FromBody] AddSkillRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Request body is required" });
                }

                if (string.IsNullOrWhiteSpace(request.SkillName))
                {
                    return BadRequest(new { success = false, message = "Skill name is required" });
                }

                var userId = GetUserId();
                var skill = await _studentService.AddSkillAsync(userId, request);
                return Ok(new { success = true, message = "Skill added successfully", skill });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpPut("skills/{skillId}")]
        public async Task<IActionResult> UpdateSkill(int skillId, [FromBody] UpdateSkillRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _studentService.UpdateSkillAsync(skillId, userId, request);
                
                if (!success)
                {
                    return NotFound(new { success = false, message = "Skill not found" });
                }

                return Ok(new { success = true, message = "Skill updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("skills/{skillId}")]
        public async Task<IActionResult> DeleteSkill(int skillId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _studentService.DeleteSkillAsync(skillId, userId);
                
                if (!success)
                {
                    return NotFound(new { success = false, message = "Skill not found" });
                }

                return Ok(new { success = true, message = "Skill deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("upload/resume")]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            try
            {
                var userId = GetUserId();
                var fileUrl = await _studentService.UploadResumeAsync(userId, file);
                return Ok(new { success = true, message = "Resume uploaded successfully", fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("upload/profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            try
            {
                var userId = GetUserId();
                var fileUrl = await _studentService.UploadProfilePictureAsync(userId, file);
                return Ok(new { success = true, message = "Profile picture uploaded successfully", fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

