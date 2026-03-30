using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class Student
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StudentId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(500)]
        public string? ResumeUrl { get; set; }

        [MaxLength(500)]
        public string? ProfilePictureUrl { get; set; }

        public string? Bio { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
