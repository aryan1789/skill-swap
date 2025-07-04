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
                _context.Users.AddRange(new[]
                {
                    new User { Name= "Aryan", Email= "aryan@example.com",Password="Password",Bio="SWE Student" },
                    new User { Name= "Teena", Email= "teena@example.com",Password="Password",Bio= "Operations Lead" }
                });

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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] User updated)
        {
            var user = await _context.Users.FindAsync(id);
            if(user == null) return NotFound();

            user.Name = updated.Name;
            user.Bio = updated.Bio;
            user.isAvailable = updated.isAvailable;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
