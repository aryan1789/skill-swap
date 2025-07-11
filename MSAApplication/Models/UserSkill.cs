using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MSAApplication.Models
{
    public class UserSkill
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        [Required]
        [JsonIgnore]
        public User User { get; set; }

        public int SkillId { get; set; }
        public Skill Skill { get; set; }
        public SkillType SkillType { get; set; }
        [Range(1, 5)]
        public int ProficiencyLevel { get; set; }
        [MaxLength(200)]
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
        public enum SkillType 
        {
            Offering = 1,
            Seeking = 2
        }
}
