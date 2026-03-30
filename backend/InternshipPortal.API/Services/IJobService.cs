using InternshipPortal.API.Models;

namespace InternshipPortal.API.Services
{
    public interface IJobService
    {
        Task<List<MatchedJob>> GetMatchedJobsForStudentAsync(int studentId, int page = 1, int limit = 10);
        Task<JobMatchScore> CalculateMatchScoreAsync(int jobId, int studentId);
    }

    public class MatchedJob
    {
        public JobPosting Job { get; set; } = null!;
        public double MatchScore { get; set; }
        public int MatchedSkillsCount { get; set; }
        public int TotalRequiredSkills { get; set; }
        public List<string> MatchedSkills { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
    }

    public class JobMatchScore
    {
        public double Score { get; set; }
        public int MatchedSkillsCount { get; set; }
        public int TotalRequiredSkills { get; set; }
        public List<string> MatchedSkills { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
    }
}

