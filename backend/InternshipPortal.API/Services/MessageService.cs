using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPortal.API.Services
{
    public class MessageService : IMessageService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public MessageService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Message> SendMessageAsync(int senderUserId, int receiverUserId, string messageText, string? subject = null, int? applicationId = null)
        {
            var message = new Message
            {
                SenderId = senderUserId,
                ReceiverId = receiverUserId,
                MessageText = messageText,
                Subject = subject,
                ApplicationId = applicationId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Create notification for receiver
            var receiver = await _context.Users.FindAsync(receiverUserId);
            if (receiver != null)
            {
                var sender = await _context.Users.FindAsync(senderUserId);
                await _notificationService.CreateNotificationAsync(
                    receiverUserId,
                    "new_message",
                    "New Message Received",
                    $"You have a new message from {sender?.Email ?? "User"}",
                    "/messages"
                );
            }

            return message;
        }

        public async Task<List<Message>> GetInboxAsync(int userId)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Application)
                    .ThenInclude(a => a.Job)
                .Where(m => m.ReceiverId == userId || m.SenderId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Message>> GetConversationAsync(int userId, int otherUserId)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Application)
                    .ThenInclude(a => a.Job)
                .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                           (m.SenderId == otherUserId && m.ReceiverId == userId))
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<object>> GetConversationsListAsync(int userId)
        {
            var conversations = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Select(g => new
                {
                    OtherUserId = g.Key,
                    LastMessage = g.OrderByDescending(m => m.CreatedAt).First(),
                    UnreadCount = g.Count(m => !m.IsRead && m.ReceiverId == userId)
                })
                .ToListAsync();

            var result = new List<object>();
            foreach (var conv in conversations)
            {
                var otherUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == conv.OtherUserId);

                string? otherUserName = null;
                if (otherUser?.UserType == UserType.Student)
                {
                    var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == conv.OtherUserId);
                    otherUserName = student != null ? $"{student.FirstName} {student.LastName}" : otherUser.Email;
                }
                else if (otherUser?.UserType == UserType.Employer)
                {
                    var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == conv.OtherUserId);
                    otherUserName = employer?.CompanyName ?? otherUser.Email;
                }

                result.Add(new
                {
                    otherUserId = conv.OtherUserId,
                    otherUserName = otherUserName ?? "Unknown",
                    otherUserEmail = otherUser?.Email,
                    lastMessage = new
                    {
                        conv.LastMessage.MessageId,
                        conv.LastMessage.MessageText,
                        conv.LastMessage.Subject,
                        conv.LastMessage.CreatedAt,
                        isFromMe = conv.LastMessage.SenderId == userId
                    },
                    unreadCount = conv.UnreadCount
                });
            }

            return result.OrderByDescending(c => ((dynamic)c).lastMessage.CreatedAt).ToList<object>();
        }

        public async Task<Message?> GetMessageAsync(int messageId, int userId)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Application)
                    .ThenInclude(a => a.Job)
                .FirstOrDefaultAsync(m => m.MessageId == messageId && 
                    (m.SenderId == userId || m.ReceiverId == userId));
        }

        public async Task MarkAsReadAsync(int messageId, int userId)
        {
            var message = await _context.Messages
                .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ReceiverId == userId);

            if (message != null)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkConversationAsReadAsync(int userId, int otherUserId)
        {
            var messages = await _context.Messages
                .Where(m => m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsRead)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Messages
                .CountAsync(m => m.ReceiverId == userId && !m.IsRead);
        }

        public async Task<bool> DeleteMessageAsync(int messageId, int userId)
        {
            var message = await _context.Messages
                .FirstOrDefaultAsync(m => m.MessageId == messageId && m.SenderId == userId);

            if (message != null)
            {
                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
    }
}

