using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InternshipPortal.API.Models
{
    public class Message
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MessageId { get; set; }

        public int? ApplicationId { get; set; }

        [Required]
        public int SenderId { get; set; }

        [Required]
        public int ReceiverId { get; set; }

        [MaxLength(255)]
        public string? Subject { get; set; }

        [Required]
        public string MessageText { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ApplicationId")]
        public Application? Application { get; set; }

        [ForeignKey("SenderId")]
        public User? Sender { get; set; }

        [ForeignKey("ReceiverId")]
        public User? Receiver { get; set; }
    }
}
