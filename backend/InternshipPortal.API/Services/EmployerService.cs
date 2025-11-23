using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace InternshipPortal.API.Services
{
    public class EmployerService : IEmployerService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public EmployerService(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<Employer?> GetEmployerProfileAsync(int userId)
        {
            return await _context.Employers
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<Employer> UpdateEmployerProfileAsync(int userId, UpdateEmployerProfileRequest request)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
            
            if (employer == null)
            {
                throw new Exception("Employer profile not found");
            }

            if (!string.IsNullOrEmpty(request.CompanyName))
                employer.CompanyName = request.CompanyName;
            if (request.CompanyDescription != null)
                employer.CompanyDescription = request.CompanyDescription;
            if (request.Industry != null)
                employer.Industry = request.Industry;
            if (request.Website != null)
                employer.Website = request.Website;
            if (request.Phone != null)
                employer.Phone = request.Phone;
            if (request.Address != null)
                employer.Address = request.Address;
            if (request.City != null)
                employer.City = request.City;
            if (request.Country != null)
                employer.Country = request.Country;

            await _context.SaveChangesAsync();
            return employer;
        }

        public async Task<string> UploadLogoAsync(int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new Exception("File is required");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".svg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
            {
                throw new Exception("Only JPG, JPEG, PNG, GIF, and SVG files are allowed");
            }

            if (file.Length > 2 * 1024 * 1024) // 2MB limit
            {
                throw new Exception("File size must be less than 2MB");
            }

            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
            if (employer == null)
            {
                throw new Exception("Employer profile not found");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "logos");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"logo_{employer.EmployerId}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/logos/{fileName}";
            employer.LogoUrl = fileUrl;
            await _context.SaveChangesAsync();

            return fileUrl;
        }
    }
}
