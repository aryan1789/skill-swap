using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MSAApplication.Context;
using MSAApplication.Models;

namespace MSAApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        // Get chat messages for a specific skill swap request
        [HttpGet("{skillSwapRequestId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetChatMessages(Guid skillSwapRequestId, [FromQuery] Guid userId)
        {
            try
            {
                // Verify the user is part of this skill swap request AND it's accepted
                var skillSwapRequest = await _context.SkillSwapRequests
                    .FirstOrDefaultAsync(r => r.Id == skillSwapRequestId && 
                                            (r.RequesterId == userId || r.TargetUserId == userId) &&
                                            r.Status == "Accepted");

                if (skillSwapRequest == null)
                {
                    return Unauthorized("You are not authorized to view this chat or the skill swap request is not accepted");
                }

                var messages = await _context.ChatMessages
                    .Where(m => m.SkillSwapRequestId == skillSwapRequestId)
                    .Include(m => m.Sender)
                    .OrderBy(m => m.SentAt)
                    .Select(m => new
                    {
                        id = m.Id,
                        skillSwapRequestId = m.SkillSwapRequestId,
                        senderId = m.SenderId,
                        senderName = m.Sender!.Name,
                        content = m.MessageContent,
                        sentAt = m.SentAt,
                        isRead = m.IsRead
                    })
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Get chat preview (last message) for all chats for a user
        [HttpGet("previews/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetChatPreviews(Guid userId)
        {
            try
            {
                var skillSwapRequests = await _context.SkillSwapRequests
                    .Where(r => (r.RequesterId == userId || r.TargetUserId == userId) && 
                               r.Status == "Accepted")
                    .Include(r => r.Requester)
                    .Include(r => r.TargetUser)
                    .ToListAsync();

                var chatPreviews = new List<object>();

                foreach (var request in skillSwapRequests)
                {
                    var lastMessage = await _context.ChatMessages
                        .Where(m => m.SkillSwapRequestId == request.Id)
                        .OrderByDescending(m => m.SentAt)
                        .FirstOrDefaultAsync();

                    var otherUser = request.RequesterId == userId ? request.TargetUser : request.Requester;

                    chatPreviews.Add(new
                    {
                        skillSwapRequestId = request.Id,
                        otherUserId = otherUser?.Id,
                        otherUserName = otherUser?.Name,
                        otherUserProfilePicture = otherUser?.ProfilePictureUrl,
                        lastMessage = lastMessage?.MessageContent,
                        lastMessageTime = lastMessage?.SentAt,
                        hasUnreadMessages = await _context.ChatMessages
                            .AnyAsync(m => m.SkillSwapRequestId == request.Id && 
                                         m.SenderId != userId && 
                                         !m.IsRead)
                    });
                }

                return Ok(chatPreviews.OrderByDescending(c => ((DateTime?)c.GetType().GetProperty("lastMessageTime")?.GetValue(c)) ?? DateTime.MinValue));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Mark messages as read
        [HttpPut("mark-read/{skillSwapRequestId}")]
        public async Task<ActionResult> MarkMessagesAsRead(Guid skillSwapRequestId, [FromBody] Guid userId)
        {
            try
            {
                var messages = await _context.ChatMessages
                    .Where(m => m.SkillSwapRequestId == skillSwapRequestId && 
                              m.SenderId != userId && 
                              !m.IsRead)
                    .ToListAsync();

                foreach (var message in messages)
                {
                    message.IsRead = true;
                }

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
