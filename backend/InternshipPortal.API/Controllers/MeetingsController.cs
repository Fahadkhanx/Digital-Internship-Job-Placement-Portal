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
    public class MeetingsController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingsController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [HttpPost]
        public async Task<IActionResult> ScheduleMeeting([FromBody] ScheduleMeetingRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Title))
                {
                    return BadRequest(new { success = false, message = "Meeting title is required" });
                }

                if (request.ParticipantId <= 0)
                {
                    return BadRequest(new { success = false, message = "Participant ID is required" });
                }

                // Allow instant meetings (video calls) - allow up to 5 minutes in the past
                // For scheduled meetings, require future time
                var now = DateTime.UtcNow;
                var fiveMinutesAgo = now.AddMinutes(-5);
                
                // If scheduled time is more than 5 minutes in the past, it's invalid
                // But allow instant video calls (within 5 minutes)
                if (request.ScheduledAt < fiveMinutesAgo)
                {
                    return BadRequest(new { success = false, message = "Scheduled time cannot be more than 5 minutes in the past" });
                }

                var organizerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                // Prevent self-meeting
                if (organizerId == request.ParticipantId)
                {
                    return BadRequest(new { success = false, message = "Cannot schedule meeting with yourself" });
                }
                
                var meeting = await _meetingService.ScheduleMeetingAsync(
                    organizerId,
                    request.ParticipantId,
                    request.Title,
                    request.ScheduledAt,
                    request.DurationMinutes,
                    request.Description,
                    request.ApplicationId
                );

                return Ok(new
                {
                    success = true,
                    message = "Meeting scheduled successfully",
                    data = new
                    {
                        meeting.MeetingId,
                        meeting.OrganizerId,
                        meeting.ParticipantId,
                        meeting.Title,
                        meeting.Description,
                        meeting.ScheduledAt,
                        meeting.DurationMinutes,
                        meeting.Status,
                        meeting.MeetingLink,
                        meeting.ApplicationId,
                        meeting.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserMeetings()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var meetings = await _meetingService.GetUserMeetingsAsync(userId);

                return Ok(new
                {
                    success = true,
                    meetings = meetings.Select(m => new
                    {
                        m.MeetingId,
                        m.OrganizerId,
                        m.ParticipantId,
                        m.Title,
                        m.Description,
                        m.ScheduledAt,
                        m.DurationMinutes,
                        m.Status,
                        m.MeetingLink,
                        m.MeetingIdExternal,
                        m.ApplicationId,
                        OrganizerEmail = m.Organizer?.Email,
                        ParticipantEmail = m.Participant?.Email,
                        m.CreatedAt
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{meetingId}")]
        public async Task<IActionResult> GetMeeting(int meetingId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var meeting = await _meetingService.GetMeetingAsync(meetingId, userId);

                if (meeting == null)
                {
                    return NotFound(new { success = false, message = "Meeting not found" });
                }

                return Ok(new
                {
                    success = true,
                    meeting = new
                    {
                        meeting.MeetingId,
                        meeting.OrganizerId,
                        meeting.ParticipantId,
                        meeting.Title,
                        meeting.Description,
                        meeting.ScheduledAt,
                        meeting.DurationMinutes,
                        meeting.Status,
                        meeting.MeetingLink,
                        meeting.MeetingIdExternal,
                        meeting.ApplicationId,
                        OrganizerEmail = meeting.Organizer?.Email,
                        ParticipantEmail = meeting.Participant?.Email,
                        meeting.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("by-external/{externalId}")]
        public async Task<IActionResult> GetMeetingByExternalId(string externalId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var meeting = await _meetingService.GetMeetingByExternalIdAsync(externalId, userId);

                if (meeting == null)
                {
                    return NotFound(new { success = false, message = "Meeting not found" });
                }

                return Ok(new
                {
                    success = true,
                    meeting = new
                    {
                        meeting.MeetingId,
                        meeting.OrganizerId,
                        meeting.ParticipantId,
                        meeting.Title,
                        meeting.Description,
                        meeting.ScheduledAt,
                        meeting.DurationMinutes,
                        meeting.Status,
                        meeting.MeetingLink,
                        meeting.MeetingIdExternal,
                        meeting.ApplicationId,
                        OrganizerEmail = meeting.Organizer?.Email,
                        ParticipantEmail = meeting.Participant?.Email,
                        meeting.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{meetingId}/status")]
        public async Task<IActionResult> UpdateMeetingStatus(int meetingId, [FromBody] UpdateMeetingStatusRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Request body is required" });
                }

                // Validate enum value
                if (!Enum.IsDefined(typeof(MeetingStatus), request.Status))
                {
                    return BadRequest(new { success = false, message = $"Invalid status value: {request.Status}. Valid values are: {string.Join(", ", Enum.GetNames(typeof(MeetingStatus)))}" });
                }

                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var meeting = await _meetingService.UpdateMeetingStatusAsync(meetingId, userId, request.Status);

                return Ok(new
                {
                    success = true,
                    message = "Meeting status updated",
                    meeting = new
                    {
                        meeting.MeetingId,
                        meeting.Status
                    }
                });
            }
            catch (Exception ex)
            {
                // Log the full exception for debugging
                Console.WriteLine($"Error updating meeting status: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { success = false, message = ex.Message, details = ex.StackTrace });
            }
        }

        [HttpPut("{meetingId}/cancel")]
        public async Task<IActionResult> CancelMeeting(int meetingId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var cancelled = await _meetingService.CancelMeetingAsync(meetingId, userId);

                if (!cancelled)
                {
                    return NotFound(new { success = false, message = "Meeting not found" });
                }

                return Ok(new { success = true, message = "Meeting cancelled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{meetingId}/reschedule")]
        public async Task<IActionResult> RescheduleMeeting(int meetingId, [FromBody] RescheduleMeetingRequest request)
        {
            try
            {
                if (request.NewScheduledAt < DateTime.UtcNow)
                {
                    return BadRequest(new { success = false, message = "New scheduled time must be in the future" });
                }

                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var rescheduled = await _meetingService.RescheduleMeetingAsync(meetingId, userId, request.NewScheduledAt);

                if (!rescheduled)
                {
                    return NotFound(new { success = false, message = "Meeting not found" });
                }

                return Ok(new { success = true, message = "Meeting rescheduled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{meetingId}/generate-link")]
        public async Task<IActionResult> GenerateMeetingLink(int meetingId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var meeting = await _meetingService.GenerateMeetingLinkAsync(meetingId, userId);

                return Ok(new
                {
                    success = true,
                    meetingLink = meeting.MeetingLink,
                    meetingIdExternal = meeting.MeetingIdExternal
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{meetingId}/offer")]
        public async Task<IActionResult> StoreOffer(int meetingId, [FromBody] StoreOfferRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _meetingService.StoreOfferAsync(meetingId, userId, request.Offer);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{meetingId}/answer")]
        public async Task<IActionResult> StoreAnswer(int meetingId, [FromBody] StoreAnswerRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _meetingService.StoreAnswerAsync(meetingId, userId, request.Answer);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{meetingId}/ice-candidate")]
        public async Task<IActionResult> StoreIceCandidate(int meetingId, [FromBody] StoreIceCandidateRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _meetingService.StoreIceCandidateAsync(meetingId, userId, request.Candidate);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{meetingId}/signaling")]
        public async Task<IActionResult> GetSignalingData(int meetingId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var signaling = await _meetingService.GetSignalingDataAsync(meetingId, userId);
                return Ok(new { success = true, signaling });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class ScheduleMeetingRequest
    {
        public int ParticipantId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public int? ApplicationId { get; set; }
    }

    public class UpdateMeetingStatusRequest
    {
        public MeetingStatus Status { get; set; }
    }

    public class RescheduleMeetingRequest
    {
        public DateTime NewScheduledAt { get; set; }
    }

    public class StoreOfferRequest
    {
        public string Offer { get; set; } = string.Empty;
        public int? UserId { get; set; }
    }

    public class StoreAnswerRequest
    {
        public string Answer { get; set; } = string.Empty;
        public int? UserId { get; set; }
    }

    public class StoreIceCandidateRequest
    {
        public string Candidate { get; set; } = string.Empty;
        public int? UserId { get; set; }
    }
}

