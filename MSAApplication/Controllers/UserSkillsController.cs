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
    [Route("api/[controller]")]
    [ApiController]
    public class UserSkillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserSkillsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/UserSkills/{userId}
        [HttpPost("{userId}")]
        public async Task<IActionResult> AddUserSkill(Guid userId, [FromBody] UserSkill userSkill)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            userSkill.UserId = userId;
            _context.UserSkills.Add(userSkill);
            await _context.SaveChangesAsync();

            return Ok(userSkill);
        }

        // GET: api/UserSkills/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserSkills(Guid userId)
        {
            var skills = await _context.UserSkills
                .Where(us => us.UserId == userId)
                .Include(us => us.Skill)
                .ToListAsync();

            return Ok(skills);
        }

        // DELETE: api/UserSkills/{userId}/{skillId}
        [HttpDelete("{userId}/{skillId}")]
        public async Task<IActionResult> RemoveUserSkill(Guid userId, int skillId)
        {
            var userSkill = await _context.UserSkills
                .FirstOrDefaultAsync(us => us.UserId == userId && us.SkillId == skillId);

            if (userSkill == null) return NotFound();

            _context.UserSkills.Remove(userSkill);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // PUT: api/UserSkills/{userId}/by-type - Update user skills by type
        [HttpPut("{userId}/by-type")]
        public async Task<IActionResult> UpdateUserSkillsByType(Guid userId, [FromBody] UserSkillsUpdateRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Remove all existing user skills
            var existingSkills = await _context.UserSkills
                .Where(us => us.UserId == userId)
                .ToListAsync();
            _context.UserSkills.RemoveRange(existingSkills);

            // Add offering skills
            foreach (var skillId in request.OfferingSkills)
            {
                _context.UserSkills.Add(new UserSkill
                {
                    UserId = userId,
                    SkillId = skillId,
                    SkillType = SkillType.Offering,
                    ProficiencyLevel = 3, // Default proficiency
                    Notes = ""
                });
            }

            // Add seeking skills
            foreach (var skillId in request.SeekingSkills)
            {
                _context.UserSkills.Add(new UserSkill
                {
                    UserId = userId,
                    SkillId = skillId,
                    SkillType = SkillType.Seeking,
                    ProficiencyLevel = 3, // Default proficiency
                    Notes = ""
                });
            }

            await _context.SaveChangesAsync();

            // Return updated user skills with skill details
            var updatedSkills = await _context.UserSkills
                .Where(us => us.UserId == userId)
                .Include(us => us.Skill)
                .ToListAsync();

            return Ok(updatedSkills);
        }

        // PUT: api/UserSkills/{userId} - Update all user skills at once
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserSkills(Guid userId, [FromBody] List<int> skillIds)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Remove all existing user skills
            var existingSkills = await _context.UserSkills
                .Where(us => us.UserId == userId)
                .ToListAsync();
            _context.UserSkills.RemoveRange(existingSkills);

            // Add new user skills
            foreach (var skillId in skillIds)
            {
                _context.UserSkills.Add(new UserSkill
                {
                    UserId = userId,
                    SkillId = skillId,
                    SkillType = SkillType.Offering, // Default to offering
                    ProficiencyLevel = 3, // Default proficiency
                    Notes = ""
                });
            }

            await _context.SaveChangesAsync();

            // Return updated user skills with skill details
            var updatedSkills = await _context.UserSkills
                .Where(us => us.UserId == userId)
                .Include(us => us.Skill)
                .ToListAsync();

            return Ok(updatedSkills);
        }
    }
}
