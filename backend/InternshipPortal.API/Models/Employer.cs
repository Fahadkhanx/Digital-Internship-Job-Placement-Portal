using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class Employer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmployerId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string CompanyName { get; set; } = string.Empty;

        public string? CompanyDescription { get; set; }

        [MaxLength(100)]
        public string? Industry { get; set; }

        [MaxLength(255)]
        public string? Website { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(500)]
        public string? LogoUrl { get; set; }

        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;

        public int? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }

    public enum VerificationStatus
    {
        Pending,
        Verified,
        Rejected
    }
}
