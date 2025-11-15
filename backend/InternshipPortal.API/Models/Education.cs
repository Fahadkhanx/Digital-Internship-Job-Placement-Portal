using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class Education
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EducationId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string InstitutionName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Degree { get; set; }

        [MaxLength(100)]
        public string? FieldOfStudy { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [Column(TypeName = "decimal(3,2)")]
        public decimal? Gpa { get; set; }

        public string? Description { get; set; }

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }
    }
}
