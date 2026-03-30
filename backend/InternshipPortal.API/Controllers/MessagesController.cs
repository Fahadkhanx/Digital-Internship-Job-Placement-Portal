using InternshipPortal.API.Services;
using InternshipPortal.API.Models;
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
                if (string.IsNullOrWhiteSpace(request.MessageText) && string.IsNullOrEmpty(request.FileUrl))
                {
                    return BadRequest(new { success = false, message = "Message text or file is required" });
                }

                var senderUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var message = await _messageService.SendMessageAsync(
                    senderUserId,
                    request.ReceiverId,
                    request.MessageText ?? string.Empty,
                    request.Subject,
                    request.ApplicationId,
                    request.MessageType,
                    request.FileUrl,
                    request.FileName,
                    request.FileType,
                    request.FileSize
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
                        message.MessageType,
                        message.FileUrl,
                        message.FileName,
                        message.FileType,
                        message.FileSize,
                        message.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "No file uploaded" });
                }

                // Validate file size (max 50MB)
                const long maxFileSize = 50 * 1024 * 1024; // 50MB
                if (file.Length > maxFileSize)
                {
                    return BadRequest(new { success = false, message = "File size exceeds 50MB limit" });
                }

                // Determine file type and folder
                var contentType = file.ContentType.ToLower();
                var fileType = DetermineMessageType(contentType);
                var folder = GetFolderForFileType(fileType);
                
                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "messages", folder);
                
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                var filePath = Path.Combine(uploadsPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/messages/{folder}/{fileName}";

                return Ok(new
                {
                    success = true,
                    fileUrl,
                    fileName = file.FileName,
                    fileType = contentType,
                    fileSize = file.Length,
                    messageType = fileType.ToString().ToLower()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private MessageType DetermineMessageType(string contentType)
        {
            if (contentType.StartsWith("image/"))
                return MessageType.Image;
            if (contentType.StartsWith("video/"))
                return MessageType.Video;
            if (contentType.StartsWith("audio/"))
                return MessageType.Voice;
            return MessageType.Document;
        }

        private string GetFolderForFileType(MessageType messageType)
        {
            return messageType switch
            {
                MessageType.Image => "images",
                MessageType.Video => "videos",
                MessageType.Voice => "voice",
                _ => "documents"
            };
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
                        m.MessageType,
                        m.FileUrl,
                        m.FileName,
                        m.FileType,
                        m.FileSize,
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
        public string? MessageText { get; set; }
        public string? Subject { get; set; }
        public int? ApplicationId { get; set; }
        public MessageType? MessageType { get; set; }
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }
        public long? FileSize { get; set; }
    }
}

