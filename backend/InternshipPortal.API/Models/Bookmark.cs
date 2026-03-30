using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class Bookmark
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BookmarkId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public int JobId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }

        [ForeignKey("JobId")]
        public JobPosting? Job { get; set; }
    }
}
