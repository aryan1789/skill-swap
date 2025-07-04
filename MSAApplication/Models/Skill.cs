using System.ComponentModel.DataAnnotations;

namespace MSAApplication.Models
{
    public class Skill
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string SkillName { get; set; }

        [MaxLength(200)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Category { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserSkill> UserSkills { get; set; } = new List<UserSkill>();
    }
}
