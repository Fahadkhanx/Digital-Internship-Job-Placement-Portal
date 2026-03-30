using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class Application
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ApplicationId { get; set; }

        [Required]
        public int JobId { get; set; }

        [Required]
        public int StudentId { get; set; }

        public string? CoverLetter { get; set; }

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }

        public string? Feedback { get; set; }

        [ForeignKey("JobId")]
        public JobPosting? Job { get; set; }

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }
    }

    public enum ApplicationStatus
    {
        Pending,
        Reviewed,
        Shortlisted,
        Rejected,
        Accepted
    }
}
