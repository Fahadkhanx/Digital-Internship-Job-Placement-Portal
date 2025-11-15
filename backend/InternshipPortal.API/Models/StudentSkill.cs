using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class StudentSkill
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SkillId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(100)]
        public string SkillName { get; set; } = string.Empty;

        public ProficiencyLevel ProficiencyLevel { get; set; } = ProficiencyLevel.Intermediate;

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }
    }

    public enum ProficiencyLevel
    {
        Beginner,
        Intermediate,
        Advanced,
        Expert
    }
}
