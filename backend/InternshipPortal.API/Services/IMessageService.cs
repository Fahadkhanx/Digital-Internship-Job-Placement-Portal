using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IMessageService
    {
        Task<Message> SendMessageAsync(int senderUserId, int receiverUserId, string messageText, string? subject = null, int? applicationId = null);
        Task<List<Message>> GetInboxAsync(int userId);
        Task<List<Message>> GetConversationAsync(int userId, int otherUserId);
        Task<List<object>> GetConversationsListAsync(int userId);
        Task<Message?> GetMessageAsync(int messageId, int userId);
        Task MarkAsReadAsync(int messageId, int userId);
        Task MarkConversationAsReadAsync(int userId, int otherUserId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> DeleteMessageAsync(int messageId, int userId);
    }
}

