namespace MSAApplication.Models
{
    public class UserUpdateRequest
    {
        public string Name { get; set; } = "";
        public string? Bio { get; set; }
        public bool isAvailable { get; set; }
        public string Email { get; set; } = "";
    }
}
