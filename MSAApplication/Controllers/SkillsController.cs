using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSAApplication.Context;
using MSAApplication.Models;
using Npgsql;

namespace MSAApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SkillsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSkills()
        {
            var skills = await _context.Skills.ToListAsync();
            return Ok(skills);
        }

        [HttpPost]
        public async Task<IActionResult> AddSkill([FromBody] Skill skill)
        {
            var exists = await _context.Skills
                .AnyAsync(s => s.SkillName.ToLower() == skill.SkillName.ToLower());

            if (exists)
            {
                return Conflict(new { message = "Skill already exists." });
            }

            _context.Skills.Add(skill);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Skill added successfully." });
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx &&
                                                pgEx.SqlState == "23505")
            {
                // fallback guard — this should rarely trigger now
                return Conflict(new { message = "Skill already exists (caught at DB level)." });
            }
        }

    }
}
