using Microsoft.Extensions.Configuration.UserSecrets;
using System.Xml;

namespace MSAApplication.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Bio {  get; set; }
        public ICollection<Skill>? SkillsOffered { get; set; }
        public ICollection<Skill>? SkillsWanted { get; set; }
    }
}
