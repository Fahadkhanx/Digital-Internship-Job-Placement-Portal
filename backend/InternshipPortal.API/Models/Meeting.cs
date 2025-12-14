using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class Meeting
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MeetingId { get; set; }

        [Required]
        public int OrganizerId { get; set; }

        [Required]
        public int ParticipantId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime ScheduledAt { get; set; }

        public int DurationMinutes { get; set; } = 30;

        public MeetingStatus Status { get; set; } = MeetingStatus.Scheduled;

        [MaxLength(500)]
        public string? MeetingLink { get; set; } // For video call link

        [MaxLength(500)]
        public string? MeetingIdExternal { get; set; } // External meeting ID (Zoom, Teams, etc.)

        public int? ApplicationId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("OrganizerId")]
        public User? Organizer { get; set; }

        [ForeignKey("ParticipantId")]
        public User? Participant { get; set; }

        [ForeignKey("ApplicationId")]
        public Application? Application { get; set; }
    }

    public enum MeetingStatus
    {
        Scheduled,
        Confirmed,
        InProgress,
        Completed,
        Cancelled,
        Rescheduled
    }
}

