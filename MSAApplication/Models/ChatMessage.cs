using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSAApplication.Models
{
    public class ChatMessage
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid SkillSwapRequestId { get; set; }

        [Required]
        public Guid SenderId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string MessageContent { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        [ForeignKey(nameof(SkillSwapRequestId))]
        public SkillSwapRequest? SkillSwapRequest { get; set; }

        [ForeignKey(nameof(SenderId))]
        public User? Sender { get; set; }
    }
}
