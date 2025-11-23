using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPortal.API.Services
{
    public class BookmarkService : IBookmarkService
    {
        private readonly ApplicationDbContext _context;

        public BookmarkService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Bookmark> AddBookmarkAsync(int userId, int jobId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new Exception("Student profile not found");
            }

            // Check if already bookmarked
            var existing = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.StudentId == student.StudentId && b.JobId == jobId);

            if (existing != null)
            {
                return existing;
            }

            var bookmark = new Bookmark
            {
                StudentId = student.StudentId,
                JobId = jobId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();

            return bookmark;
        }

        public async Task<bool> RemoveBookmarkAsync(int userId, int jobId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return false;
            }

            var bookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.StudentId == student.StudentId && b.JobId == jobId);

            if (bookmark == null)
            {
                return false;
            }

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<Bookmark>> GetBookmarksAsync(int userId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return new List<Bookmark>();
            }

            return await _context.Bookmarks
                .Include(b => b.Job)
                    .ThenInclude(j => j.Employer)
                .Where(b => b.StudentId == student.StudentId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> IsBookmarkedAsync(int userId, int jobId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                return false;
            }

            return await _context.Bookmarks
                .AnyAsync(b => b.StudentId == student.StudentId && b.JobId == jobId);
        }
    }
}

