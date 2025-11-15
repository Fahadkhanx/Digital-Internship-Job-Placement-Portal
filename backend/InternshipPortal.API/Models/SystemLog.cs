using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class SystemLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogId { get; set; }

        [Required]
        public int AdminId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ActionType { get; set; } = string.Empty;

        public int? TargetUserId { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("AdminId")]
        public User? Admin { get; set; }

        [ForeignKey("TargetUserId")]
        public User? TargetUser { get; set; }
    }
}
