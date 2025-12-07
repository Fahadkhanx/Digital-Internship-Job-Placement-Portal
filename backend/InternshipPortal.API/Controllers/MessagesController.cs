using InternshipPortal.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.MessageText))
                {
                    return BadRequest(new { success = false, message = "Message text is required" });
                }

                var senderUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var message = await _messageService.SendMessageAsync(
                    senderUserId,
                    request.ReceiverId,
                    request.MessageText,
                    request.Subject,
                    request.ApplicationId
                );

                return Ok(new
                {
                    success = true,
                    message = "Message sent successfully",
                    data = new
                    {
                        message.MessageId,
                        message.SenderId,
                        message.ReceiverId,
                        message.MessageText,
                        message.Subject,
                        message.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("inbox")]
        public async Task<IActionResult> GetInbox()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var messages = await _messageService.GetInboxAsync(userId);

                return Ok(new
                {
                    success = true,
                    messages = messages.Select(m => new
                    {
                        m.MessageId,
                        m.SenderId,
                        m.ReceiverId,
                        m.MessageText,
                        m.Subject,
                        m.IsRead,
                        m.CreatedAt,
                        m.ApplicationId,
                        SenderEmail = m.Sender?.Email,
                        ReceiverEmail = m.Receiver?.Email
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var conversations = await _messageService.GetConversationsListAsync(userId);

                return Ok(new
                {
                    success = true,
                    conversations
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("conversation/{otherUserId}")]
        public async Task<IActionResult> GetConversation(int otherUserId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var messages = await _messageService.GetConversationAsync(userId, otherUserId);

                // Mark conversation as read
                await _messageService.MarkConversationAsReadAsync(userId, otherUserId);

                return Ok(new
                {
                    success = true,
                    messages = messages.Select(m => new
                    {
                        m.MessageId,
                        m.SenderId,
                        m.ReceiverId,
                        m.MessageText,
                        m.Subject,
                        m.IsRead,
                        m.CreatedAt,
                        m.ApplicationId,
                        SenderEmail = m.Sender?.Email,
                        ReceiverEmail = m.Receiver?.Email,
                        IsFromMe = m.SenderId == userId
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var count = await _messageService.GetUnreadCountAsync(userId);

                return Ok(new
                {
                    success = true,
                    count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{messageId}/read")]
        public async Task<IActionResult> MarkAsRead(int messageId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _messageService.MarkAsReadAsync(messageId, userId);

                return Ok(new { success = true, message = "Message marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{messageId}")]
        public async Task<IActionResult> DeleteMessage(int messageId)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var deleted = await _messageService.DeleteMessageAsync(messageId, userId);

                if (deleted)
                {
                    return Ok(new { success = true, message = "Message deleted" });
                }

                return NotFound(new { success = false, message = "Message not found or you don't have permission" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class SendMessageRequest
    {
        public int ReceiverId { get; set; }
        public string MessageText { get; set; } = string.Empty;
        public string? Subject { get; set; }
        public int? ApplicationId { get; set; }
    }
}

