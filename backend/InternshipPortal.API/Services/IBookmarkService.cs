using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IBookmarkService
    {
        Task<Bookmark> AddBookmarkAsync(int userId, int jobId);
        Task<bool> RemoveBookmarkAsync(int userId, int jobId);
        Task<List<Bookmark>> GetBookmarksAsync(int userId);
        Task<bool> IsBookmarkedAsync(int userId, int jobId);
    }
}

