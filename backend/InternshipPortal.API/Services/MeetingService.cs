using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPortal.API.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public MeetingService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Meeting> ScheduleMeetingAsync(int organizerId, int participantId, string title, DateTime scheduledAt, int durationMinutes, string? description = null, int? applicationId = null)
        {
            // Validate participant exists
            var participant = await _context.Users.FindAsync(participantId);
            if (participant == null)
            {
                throw new Exception("Participant not found");
            }

            // Validate organizer exists
            var organizer = await _context.Users.FindAsync(organizerId);
            if (organizer == null)
            {
                throw new Exception("Organizer not found");
            }

            var meeting = new Meeting
            {
                OrganizerId = organizerId,
                ParticipantId = participantId,
                Title = title,
                Description = description,
                ScheduledAt = scheduledAt,
                DurationMinutes = durationMinutes,
                Status = MeetingStatus.Scheduled,
                ApplicationId = applicationId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            // Create notification for participant
            try
            {
                await _notificationService.CreateNotificationAsync(
                    participantId,
                    "meeting_scheduled",
                    "New Meeting Scheduled",
                    $"You have a meeting scheduled: {title} on {scheduledAt:MMM dd, yyyy 'at' hh:mm tt}",
                    "/messages"
                );
            }
            catch (Exception ex)
            {
                // Log but don't fail meeting creation if notification fails
                Console.WriteLine($"Failed to create notification: {ex.Message}");
            }

            return meeting;
        }

        public async Task<List<Meeting>> GetUserMeetingsAsync(int userId)
        {
            return await _context.Meetings
                .Include(m => m.Organizer)
                .Include(m => m.Participant)
                .Include(m => m.Application)
                .Where(m => m.OrganizerId == userId || m.ParticipantId == userId)
                .OrderBy(m => m.ScheduledAt)
                .ToListAsync();
        }

        public async Task<Meeting?> GetMeetingAsync(int meetingId, int userId)
        {
            return await _context.Meetings
                .Include(m => m.Organizer)
                .Include(m => m.Participant)
                .Include(m => m.Application)
                .FirstOrDefaultAsync(m => m.MeetingId == meetingId && 
                    (m.OrganizerId == userId || m.ParticipantId == userId));
        }

        public async Task<Meeting?> GetMeetingByExternalIdAsync(string externalId, int userId)
        {
            return await _context.Meetings
                .Include(m => m.Organizer)
                .Include(m => m.Participant)
                .Include(m => m.Application)
                .FirstOrDefaultAsync(m => m.MeetingIdExternal == externalId && 
                    (m.OrganizerId == userId || m.ParticipantId == userId));
        }

        public async Task<Meeting> UpdateMeetingStatusAsync(int meetingId, int userId, MeetingStatus status)
        {
            try
            {
                var meeting = await _context.Meetings
                    .FirstOrDefaultAsync(m => m.MeetingId == meetingId && 
                        (m.OrganizerId == userId || m.ParticipantId == userId));

                if (meeting == null)
                {
                    throw new Exception("Meeting not found or you don't have permission");
                }

                meeting.Status = status;
                meeting.UpdatedAt = DateTime.UtcNow;
                
                var changes = await _context.SaveChangesAsync();
                
                if (changes == 0)
                {
                    throw new Exception("Failed to update meeting status. No changes were saved.");
                }

                return meeting;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateMeetingStatusAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> CancelMeetingAsync(int meetingId, int userId)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.MeetingId == meetingId && 
                    (m.OrganizerId == userId || m.ParticipantId == userId));

            if (meeting == null)
            {
                return false;
            }

            meeting.Status = MeetingStatus.Cancelled;
            meeting.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Notify the other participant
            var otherUserId = meeting.OrganizerId == userId ? meeting.ParticipantId : meeting.OrganizerId;
            await _notificationService.CreateNotificationAsync(
                otherUserId,
                "meeting_cancelled",
                "Meeting Cancelled",
                $"Meeting '{meeting.Title}' has been cancelled",
                "/messages"
            );

            return true;
        }

        public async Task<bool> RescheduleMeetingAsync(int meetingId, int userId, DateTime newScheduledAt)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.MeetingId == meetingId && 
                    (m.OrganizerId == userId || m.ParticipantId == userId));

            if (meeting == null)
            {
                return false;
            }

            meeting.ScheduledAt = newScheduledAt;
            meeting.Status = MeetingStatus.Rescheduled;
            meeting.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Notify the other participant
            var otherUserId = meeting.OrganizerId == userId ? meeting.ParticipantId : meeting.OrganizerId;
            await _notificationService.CreateNotificationAsync(
                otherUserId,
                "meeting_rescheduled",
                "Meeting Rescheduled",
                $"Meeting '{meeting.Title}' has been rescheduled to {newScheduledAt:MMM dd, yyyy 'at' hh:mm tt}",
                "/messages"
            );

            return true;
        }

        public async Task<Meeting> GenerateMeetingLinkAsync(int meetingId, int userId)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(m => m.MeetingId == meetingId && 
                    (m.OrganizerId == userId || m.ParticipantId == userId));

            if (meeting == null)
            {
                throw new Exception("Meeting not found or you don't have permission");
            }

            // Generate a simple meeting link (in production, you'd use a service like Zoom, Teams, or Jitsi)
            if (string.IsNullOrEmpty(meeting.MeetingLink))
            {
                var meetingIdExternal = Guid.NewGuid().ToString();
                meeting.MeetingIdExternal = meetingIdExternal;
                meeting.MeetingLink = $"/video-call/{meetingIdExternal}";
                meeting.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return meeting;
        }

        // In-memory storage for WebRTC signaling (for production, use Redis or database)
        private static readonly Dictionary<int, Dictionary<string, object>> SignalingStore = new();
        private static readonly object SignalingLock = new();

        public async Task StoreOfferAsync(int meetingId, int userId, string offer)
        {
            await Task.Run(() =>
            {
                lock (SignalingLock)
                {
                    if (!SignalingStore.ContainsKey(meetingId))
                    {
                        SignalingStore[meetingId] = new Dictionary<string, object>();
                    }
                    SignalingStore[meetingId]["offer"] = offer;
                    SignalingStore[meetingId]["offerUserId"] = userId;
                }
            });
        }

        public async Task StoreAnswerAsync(int meetingId, int userId, string answer)
        {
            await Task.Run(() =>
            {
                lock (SignalingLock)
                {
                    if (!SignalingStore.ContainsKey(meetingId))
                    {
                        SignalingStore[meetingId] = new Dictionary<string, object>();
                    }
                    SignalingStore[meetingId]["answer"] = answer;
                    SignalingStore[meetingId]["answerUserId"] = userId;
                }
            });
        }

        public async Task StoreIceCandidateAsync(int meetingId, int userId, string candidate)
        {
            await Task.Run(() =>
            {
                lock (SignalingLock)
                {
                    if (!SignalingStore.ContainsKey(meetingId))
                    {
                        SignalingStore[meetingId] = new Dictionary<string, object>();
                    }
                    if (!SignalingStore[meetingId].ContainsKey("iceCandidates"))
                    {
                        SignalingStore[meetingId]["iceCandidates"] = new List<object>();
                    }
                    var candidates = (List<object>)SignalingStore[meetingId]["iceCandidates"];
                    candidates.Add(new { candidate, userId });
                }
            });
        }

        public async Task<object> GetSignalingDataAsync(int meetingId, int userId)
        {
            // Verify user has access to this meeting
            var meeting = await GetMeetingAsync(meetingId, userId);
            if (meeting == null)
            {
                throw new Exception("Meeting not found or access denied");
            }

            return await Task.Run(() =>
            {
                lock (SignalingLock)
                {
                    if (!SignalingStore.ContainsKey(meetingId))
                    {
                        return new { offer = (string?)null, answer = (string?)null, iceCandidates = new List<object>() };
                    }

                    var store = SignalingStore[meetingId];
                    var result = new
                    {
                        offer = store.ContainsKey("offer") ? store["offer"] as string : (string?)null,
                        answer = store.ContainsKey("answer") ? store["answer"] as string : (string?)null,
                        iceCandidates = store.ContainsKey("iceCandidates") ? (store["iceCandidates"] as List<object> ?? new List<object>()) : new List<object>()
                    };
                    return result;
                }
            });
        }
    }
}

