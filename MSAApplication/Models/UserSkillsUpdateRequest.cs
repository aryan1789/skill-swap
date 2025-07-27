namespace MSAApplication.Models
{
    public class UserSkillsUpdateRequest
    {
        public List<int> OfferingSkills { get; set; } = new List<int>();
        public List<int> SeekingSkills { get; set; } = new List<int>();
    }
}
