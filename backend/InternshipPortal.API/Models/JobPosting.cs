using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class JobPosting
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int JobId { get; set; }

        [Required]
        public int EmployerId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public JobType JobType { get; set; }

        [MaxLength(255)]
        public string? Location { get; set; }

        public bool RemoteOption { get; set; } = false;

        [Column(TypeName = "decimal(10,2)")]
        public decimal? SalaryMin { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? SalaryMax { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        public string? RequiredSkills { get; set; }

        [MaxLength(255)]
        public string? RequiredEducation { get; set; }

        public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.Entry;

        public DateTime? ApplicationDeadline { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("EmployerId")]
        public Employer? Employer { get; set; }
    }

    public enum JobType
    {
        Internship,
        FullTime,
        PartTime,
        Contract
    }

    public enum ExperienceLevel
    {
        Entry,
        Junior,
        Mid,
        Senior
    }
}
