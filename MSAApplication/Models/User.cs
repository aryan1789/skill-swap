using Microsoft.Extensions.Configuration.UserSecrets;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Xml;

namespace MSAApplication.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(30)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [MaxLength(500)]
        public string? Bio {  get; set; }
        
        [Required]
        public string? Occupation { get; set; }

       // [JsonPropertyName("profilePicUrl")]
//        public string? ProfilePictureUrl { get; set; }

        public bool isAvailable { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ICollection<UserSkill> UserSkills { get; set; } = new List<UserSkill>();
    }
}
