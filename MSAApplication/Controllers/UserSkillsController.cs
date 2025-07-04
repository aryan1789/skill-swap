using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using MSAApplication.Context;
using MSAApplication.Models;

namespace MSAApplication.Controllers
{
    public class UserSkillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserSkillsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: UserSkills
        [HttpPost]
        public async Task<IActionResult> AddUserSkill(Guid userId, [FromBody] UserSkill userSkill)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            userSkill.UserId = userId;
            _context.UserSkills.Add(userSkill);
            await _context.SaveChangesAsync();

            return Ok(userSkill);
        }

        // GET: UserSkills/Details/5
        [HttpGet]
        public async Task<IActionResult> GetUserSkills(Guid userId)
        {
            var skills = await _context.UserSkills
                .Where(us => us.UserId == userId)
                .Include(us => us.Skill)
                .ToListAsync();

            return Ok(skills);
        }

    }
}
