using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MSAApplication.Models
{
    public class SkillSwapRequest
    {
        [Key]
        public Guid Id {  get; set; }

        [Required]
        public Guid RequesterId { get; set; } //User.Id of User who requested the swap
        
        [Required]
        public Guid TargetUserId { get; set; }
        
        [Required]
        public int OfferedSkillId { get; set; }//Id of User's Skill from User Skill Model?
        
        [Required]
        public int TargetSkillId { get; set; }
        public string? Status { get; set; } = "N/A"; // N/A, Pending, Accepted, Declined
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(RequesterId))]
        public User? Requester { get; set; }

        [ForeignKey(nameof(TargetUserId))]
        public User? TargetUser { get; set; }

        [ForeignKey(nameof(OfferedSkillId))]
        public UserSkill? OfferedSkill { get; set; }

        [ForeignKey(nameof(TargetSkillId))]
        public UserSkill? TargetSkill { get; set; }
    }
}
