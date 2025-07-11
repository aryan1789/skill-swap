using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSAApplication.Context;
using MSAApplication.Models;

namespace MSAApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;

            if (!_context.Users.Any())
            {
                var skillReact = new Skill { SkillName = "React", Category = "Programming" };
                var skillCS = new Skill { SkillName = "C#", Category = "Programming" };

                _context.Skills.AddRange(skillReact, skillCS);
                _context.SaveChanges(); //  Save first to generate IDs



                var aryan = new User { Name= "Aryan", Email= "aryan@example.com",Password="Password",Occupation="SWE Student",Bio= ". I’m currently in my penultimate year of a Software Engineering degree at Auckland University of Technology, and I’m eager to gain real-world experience working on meaningful engineering projects alongside experienced mentors.", UserSkills = new List<UserSkill> { new UserSkill { SkillId = skillCS.Id, SkillType=SkillType.Offering,ProficiencyLevel=4,Notes="Comfortable with .NET backend"} } };
                var teena = new User { Name= "Teena", Email= "teena@example.com",Password="Password",Occupation="Operations Lead",Bio= "Operations Lead", UserSkills = new List<UserSkill> { new UserSkill { SkillId = skillReact.Id,SkillType=SkillType.Offering,ProficiencyLevel=3,Notes="dsfsdf" } } };
                var amit = new User {Name="Amit", Email="amit@example.com",Password="Password",Bio="Tax Accountant" };

                _context.Users.AddRange(aryan, teena, amit);
                _context.SaveChanges();
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user) 
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById),new {id=user.Id },user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

            if (user == null) return Unauthorized("Invalid Credentials");

            return Ok(user);
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id) 
        {
            var user = await _context.Users
                .Include(u => u.UserSkills)
                .ThenInclude(us => us.Skill)
                .FirstOrDefaultAsync(u =>u.Id==id);

            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserSkills)
                .ThenInclude(us => us.Skill)
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] User updated)
        {
            var user = await _context.Users.FindAsync(id);
            if(user == null) return NotFound();

            user.Name = updated.Name;
            user.Bio = updated.Bio;
            user.isAvailable = updated.isAvailable;
            user.Email = updated.Email;
            user.Password = updated.Password;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
