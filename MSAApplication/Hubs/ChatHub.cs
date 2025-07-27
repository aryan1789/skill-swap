using Microsoft.AspNetCore.SignalR;
using MSAApplication.Context;
using MSAApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace MSAApplication.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        public async Task JoinChat(string skillSwapRequestId, string userId)
        {
            try
            {
                if (!Guid.TryParse(skillSwapRequestId, out var requestGuid) || 
                    !Guid.TryParse(userId, out var userGuid))
                {
                    await Clients.Caller.SendAsync("Error", "Invalid request or user ID");
                    return;
                }

                // Verify the user is part of this accepted skill swap request
                var skillSwapRequest = await _context.SkillSwapRequests
                    .FirstOrDefaultAsync(r => r.Id == requestGuid && 
                                            (r.RequesterId == userGuid || r.TargetUserId == userGuid) &&
                                            r.Status == "Accepted");

                if (skillSwapRequest == null)
                {
                    await Clients.Caller.SendAsync("Error", "Unauthorized or skill swap request not accepted");
                    return;
                }

                await Groups.AddToGroupAsync(Context.ConnectionId, $"chat_{skillSwapRequestId}");
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to join chat: {ex.Message}");
            }
        }

        public async Task LeaveChat(string skillSwapRequestId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat_{skillSwapRequestId}");
        }

        public async Task SendMessage(string skillSwapRequestId, string senderId, string content)
        {
            try
            {
                // Validate inputs
                if (!Guid.TryParse(skillSwapRequestId, out var requestGuid) || 
                    !Guid.TryParse(senderId, out var senderGuid))
                {
                    await Clients.Caller.SendAsync("Error", "Invalid request or sender ID");
                    return;
                }

                // Verify the skill swap request exists, sender is part of it, AND it's accepted
                var skillSwapRequest = await _context.SkillSwapRequests
                    .FirstOrDefaultAsync(r => r.Id == requestGuid && 
                                            (r.RequesterId == senderGuid || r.TargetUserId == senderGuid) &&
                                            r.Status == "Accepted");

                if (skillSwapRequest == null)
                {
                    await Clients.Caller.SendAsync("Error", "Unauthorized or skill swap request not accepted");
                    return;
                }

                // Create and save the chat message
                var chatMessage = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SkillSwapRequestId = requestGuid,
                    SenderId = senderGuid,
                    MessageContent = content.Trim(),
                    SentAt = DateTime.UtcNow,
                    IsRead = false
                };

                _context.ChatMessages.Add(chatMessage);
                await _context.SaveChangesAsync();

                // Get sender information for the message
                var sender = await _context.Users.FindAsync(senderGuid);

                var messageData = new
                {
                    id = chatMessage.Id,
                    skillSwapRequestId = chatMessage.SkillSwapRequestId,
                    senderId = chatMessage.SenderId,
                    senderName = sender?.Name ?? "Unknown",
                    content = chatMessage.MessageContent,
                    sentAt = chatMessage.SentAt,
                    isRead = chatMessage.IsRead
                };

                // Send message to all users in this chat EXCEPT the sender
                await Clients.GroupExcept($"chat_{skillSwapRequestId}", Context.ConnectionId).SendAsync("ReceiveMessage", messageData);
                
                // Send confirmation to sender
                await Clients.Caller.SendAsync("ReceiveMessage", messageData);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to send message: {ex.Message}");
            }
        }

        public async Task MarkAsRead(string messageId)
        {
            try
            {
                if (!Guid.TryParse(messageId, out var msgGuid))
                {
                    return;
                }

                var message = await _context.ChatMessages.FindAsync(msgGuid);
                if (message != null)
                {
                    message.IsRead = true;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to mark message as read: {ex.Message}");
            }
        }
    }
}
