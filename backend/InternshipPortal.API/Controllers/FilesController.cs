using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public FilesController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpGet("resume/{fileName}")]
        public IActionResult GetResume(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_environment.ContentRootPath, "uploads", "resumes", fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { success = false, message = "File not found" });
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = GetContentType(filePath);
                
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("profile/{fileName}")]
        public IActionResult GetProfilePicture(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_environment.ContentRootPath, "uploads", "profiles", fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { success = false, message = "File not found" });
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = GetContentType(filePath);
                
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("logo/{fileName}")]
        public IActionResult GetLogo(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_environment.ContentRootPath, "uploads", "logos", fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { success = false, message = "File not found" });
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = GetContentType(filePath);
                
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private string GetContentType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".svg" => "image/svg+xml",
                _ => "application/octet-stream"
            };
        }
    }
}

