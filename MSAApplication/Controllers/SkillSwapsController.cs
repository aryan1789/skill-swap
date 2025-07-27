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
            Console.WriteLine("=== SKILL SWAP REQUEST DEBUG ===");
            Console.WriteLine($"Received payload: RequesterId={skillSwapRequest.RequesterId}, TargetUserId={skillSwapRequest.TargetUserId}, OfferedSkillId={skillSwapRequest.OfferedSkillId}, TargetSkillId={skillSwapRequest.TargetSkillId}");
            Console.WriteLine("=================================");

            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (skillSwapRequest.OfferedSkillId == 0 || skillSwapRequest.TargetSkillId == 0)
                return BadRequest("Both offered and requested skill IDs must be provided.");

            // Verify skill IDs exist in database
            var offeredOk = await _context.UserSkills.AnyAsync(u => u.Id == skillSwapRequest.OfferedSkillId);
            var targetOk = await _context.UserSkills.AnyAsync(u => u.Id == skillSwapRequest.TargetSkillId);
            
            Console.WriteLine($"Skill validation: OfferedSkillId {skillSwapRequest.OfferedSkillId} exists: {offeredOk}, TargetSkillId {skillSwapRequest.TargetSkillId} exists: {targetOk}");
            
            if (!offeredOk || !targetOk)
                return BadRequest("OfferedSkillId or TargetSkillId is invalid.");

            skillSwapRequest.Id = Guid.NewGuid();
            skillSwapRequest.CreatedAt = DateTime.UtcNow;
            skillSwapRequest.Status = "N/A";

            _context.SkillSwapRequests.Add(skillSwapRequest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = skillSwapRequest.Id }, skillSwapRequest);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var swaps = await _context.SkillSwapRequests
                .Include(ss => ss.Requester)
                .Include(ss => ss.TargetUser)
                .Include(ss => ss.OfferedSkill).ThenInclude(us => us.Skill)
                .Include(ss => ss.TargetSkill).ThenInclude(us => us.Skill)
                .ToListAsync();

            var response = swaps.Select(s => new
            {
                Swap = s,
                ProficiencyWarning = GetProficiencyWarning(s)
            });

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var swap = await _context.SkillSwapRequests
                .Include(ss => ss.Requester)
                .Include(ss => ss.TargetUser)
                .Include(ss => ss.OfferedSkill).ThenInclude(us => us.Skill)
                .Include(ss => ss.TargetSkill).ThenInclude(us => us.Skill)
                .FirstOrDefaultAsync(ss => ss.Id == id);

            if (swap == null) return NotFound();

            return Ok(new
            {
                Swap = swap,
                ProficiencyWarning = GetProficiencyWarning(swap)
            });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(Guid userId)
        {
            var swaps = await _context.SkillSwapRequests
                .Where(ss => ss.RequesterId == userId || ss.TargetUserId == userId)
                .Include(ss => ss.Requester)
                .Include(ss => ss.TargetUser)
                .Include(ss => ss.OfferedSkill).ThenInclude(us => us.Skill)
                .Include(ss => ss.TargetSkill).ThenInclude(us => us.Skill)
                .ToListAsync();

            var response = swaps.Select(s => new
            {
                Swap = s,
                ProficiencyWarning = GetProficiencyWarning(s)
            });

            return Ok(response);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string newStatus)
        {
            var swap = await _context.SkillSwapRequests.FindAsync(id);
            if (swap == null) return NotFound();

            if (newStatus != "Accepted" && newStatus != "Declined")
                return BadRequest("Status must be 'Accepted' or 'Declined'");

            swap.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(swap);
        }

        // 1. View all swap requests for a user
        [HttpGet("requests/{userId}")]
        public async Task<IActionResult> GetRequests(Guid userId)
        {
            var outgoing = await _context.SkillSwapRequests
                .Include(r => r.TargetUser)
                .Include(r => r.OfferedSkill).ThenInclude(us=>us.Skill)
                .Include(r => r.TargetSkill).ThenInclude(us=>us.Skill)
                .Where(r => r.RequesterId == userId)
                .ToListAsync();

            var incoming = await _context.SkillSwapRequests
                .Include(r => r.Requester)
                .Include(r => r.TargetUser)
                .Include(r => r.OfferedSkill).ThenInclude(us=>us.Skill)
                .Include(r => r.TargetSkill).ThenInclude(us=>us.Skill)
                .Where(r => r.TargetUserId == userId)
                .ToListAsync();

            return Ok(new { outgoing, incoming });
        }




        // === Helper method ===
        private string? GetProficiencyWarning(SkillSwapRequest s)
        {
            if (s.OfferedSkill == null || s.TargetSkill == null)
                return null;

            int offeredLevel = s.OfferedSkill.ProficiencyLevel;
            int requestedLevel = s.TargetSkill.ProficiencyLevel;

            int diff = Math.Abs(offeredLevel - requestedLevel);

            if (diff >= 2)
            {
                return $"⚠️ There is a significant proficiency gap: Offered skill level {offeredLevel}, Requested skill level {requestedLevel}.";
            }

            return null;
        }


    }
     

    }
