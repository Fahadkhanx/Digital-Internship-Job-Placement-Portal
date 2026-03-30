using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IEmployerService
    {
        Task<Employer?> GetEmployerProfileAsync(int userId);
        Task<Employer> UpdateEmployerProfileAsync(int userId, UpdateEmployerProfileRequest request);
        Task<string> UploadLogoAsync(int userId, IFormFile file);
    }

    public class UpdateEmployerProfileRequest
    {
        public string? CompanyName { get; set; }
        public string? CompanyDescription { get; set; }
        public string? Industry { get; set; }
        public string? Website { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
    }
}
