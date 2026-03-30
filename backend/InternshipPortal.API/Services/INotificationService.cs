using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface INotificationService
    {
        Task<List<Notification>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
        Task<Notification> CreateNotificationAsync(int userId, string type, string title, string message, string? link = null);
        Task MarkAsReadAsync(int notificationId, int userId);
        Task MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task DeleteNotificationAsync(int notificationId, int userId);
    }
}

