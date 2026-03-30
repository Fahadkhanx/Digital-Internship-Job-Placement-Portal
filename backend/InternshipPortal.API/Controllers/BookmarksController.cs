using InternshipPortal.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Student")]
    public class BookmarksController : ControllerBase
    {
        private readonly IBookmarkService _bookmarkService;

        public BookmarksController(IBookmarkService bookmarkService)
        {
            _bookmarkService = bookmarkService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpPost("{jobId}")]
        public async Task<IActionResult> AddBookmark(int jobId)
        {
            try
            {
                var userId = GetUserId();
                var bookmark = await _bookmarkService.AddBookmarkAsync(userId, jobId);
                return Ok(new { success = true, message = "Job bookmarked successfully", bookmark });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{jobId}")]
        public async Task<IActionResult> RemoveBookmark(int jobId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _bookmarkService.RemoveBookmarkAsync(userId, jobId);
                if (!success)
                {
                    return NotFound(new { success = false, message = "Bookmark not found" });
                }
                return Ok(new { success = true, message = "Bookmark removed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetBookmarks()
        {
            try
            {
                var userId = GetUserId();
                var bookmarks = await _bookmarkService.GetBookmarksAsync(userId);
                return Ok(new { success = true, bookmarks });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("check/{jobId}")]
        public async Task<IActionResult> CheckBookmark(int jobId)
        {
            try
            {
                var userId = GetUserId();
                var isBookmarked = await _bookmarkService.IsBookmarkedAsync(userId, jobId);
                return Ok(new { success = true, isBookmarked });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

