using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSAApplication.Context;
using MSAApplication.Models;

namespace MSAApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillSwapsController : Controller
    {
        private readonly AppDbContext _context;

        public SkillSwapsController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpPost]
        public async Task<IActionResult> AddSkillSwapRequest([FromBody] SkillSwapRequest skillSwapRequest)
        {
            if(!ModelState.IsValid)  return BadRequest(ModelState);

            
            skillSwapRequest.Id = Guid.NewGuid();
            skillSwapRequest.CreatedAt = DateTime.UtcNow;
            skillSwapRequest.Status = "N/A";

            _context.SkillSwapRequests.Add(skillSwapRequest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById),new {id=skillSwapRequest.Id},skillSwapRequest);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var swaps = await _context.SkillSwapRequests
                .Include(ss => ss.Requester)
                .Include(ss => ss.TargetUser)
                .Include(ss => ss.OfferedSkill)
                .ThenInclude(us => us.Skill)
                .Include(ss=>ss.RequestedSkill)
                .ThenInclude(us=>us.Skill)
                .ToListAsync();

            return Ok(swaps);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var swap = await _context.SkillSwapRequests
                .Include(ss => ss.Requester)
                .Include(ss => ss.TargetUser)
                .Include(ss => ss.OfferedSkill)
                .ThenInclude(us => us.Skill)
                .Include(ss => ss.RequestedSkill)
                .ThenInclude(us => us.Skill)
                .FirstOrDefaultAsync(ss => ss.Id == id);

            if (swap == null) return NotFound();

            return Ok(swap);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(Guid userId)
        {
            var swaps = await _context.SkillSwapRequests
                .Where(ss => ss.RequesterId == userId || ss.TargetUserId == userId)
                .Include(ss => ss.Requester)
                .Include(ss => ss.TargetUser)
                .Include(ss => ss.OfferedSkill)
                .ThenInclude(us => us.Skill)
                .Include(s => s.RequestedSkill)
                .ThenInclude(us => us.Skill)
                .ToListAsync();

            return Ok(swaps);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string newStatus)
        {
            var swap = await _context.SkillSwapRequests.FindAsync(id);
            if (swap == null) return NotFound();

            swap.Status = newStatus;
            if (swap == null) return NotFound();

            swap.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(swap);
        }
    }
}
