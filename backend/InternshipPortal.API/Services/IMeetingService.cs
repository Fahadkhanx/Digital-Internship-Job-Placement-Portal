using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IMeetingService
    {
        Task<Meeting> ScheduleMeetingAsync(int organizerId, int participantId, string title, DateTime scheduledAt, int durationMinutes, string? description = null, int? applicationId = null);
        Task<List<Meeting>> GetUserMeetingsAsync(int userId);
        Task<Meeting?> GetMeetingAsync(int meetingId, int userId);
        Task<Meeting?> GetMeetingByExternalIdAsync(string externalId, int userId);
        Task<Meeting> UpdateMeetingStatusAsync(int meetingId, int userId, MeetingStatus status);
        Task<bool> CancelMeetingAsync(int meetingId, int userId);
        Task<bool> RescheduleMeetingAsync(int meetingId, int userId, DateTime newScheduledAt);
        Task<Meeting> GenerateMeetingLinkAsync(int meetingId, int userId);
        Task StoreOfferAsync(int meetingId, int userId, string offer);
        Task StoreAnswerAsync(int meetingId, int userId, string answer);
        Task StoreIceCandidateAsync(int meetingId, int userId, string candidate);
        Task<object> GetSignalingDataAsync(int meetingId, int userId);
    }
}

