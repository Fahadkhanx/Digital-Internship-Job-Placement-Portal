using InternshipPortal.API.Data;
using InternshipPortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPortal.API.Services
{
    public class JobService : IJobService
    {
        private readonly ApplicationDbContext _context;

        public JobService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MatchedJob>> GetMatchedJobsForStudentAsync(int studentId, int page = 1, int limit = 10)
        {
            // Get student skills
            var studentSkills = await _context.StudentSkills
                .Where(s => s.StudentId == studentId)
                .Select(s => s.SkillName.ToLower())
                .ToListAsync();

            if (studentSkills.Count == 0)
            {
                // If student has no skills, return all active jobs without match scores
                var allJobs = await _context.JobPostings
                    .Include(j => j.Employer)
                    .ThenInclude(e => e.User)
                    .Where(j => j.IsActive && j.Employer.VerificationStatus == VerificationStatus.Verified)
                    .OrderByDescending(j => j.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                return allJobs.Select(job => new MatchedJob
                {
                    Job = job,
                    MatchScore = 0,
                    MatchedSkillsCount = 0,
                    TotalRequiredSkills = 0,
                    MatchedSkills = new List<string>(),
                    MissingSkills = new List<string>()
                }).ToList();
            }

            // Get all active jobs from verified employers
            var jobs = await _context.JobPostings
                .Include(j => j.Employer)
                .ThenInclude(e => e.User)
                .Where(j => j.IsActive && j.Employer.VerificationStatus == VerificationStatus.Verified)
                .ToListAsync();

            var matchedJobs = new List<MatchedJob>();

            foreach (var job in jobs)
            {
                var matchScore = await CalculateMatchScoreAsync(job.JobId, studentId);
                
                matchedJobs.Add(new MatchedJob
                {
                    Job = job,
                    MatchScore = matchScore.Score,
                    MatchedSkillsCount = matchScore.MatchedSkillsCount,
                    TotalRequiredSkills = matchScore.TotalRequiredSkills,
                    MatchedSkills = matchScore.MatchedSkills,
                    MissingSkills = matchScore.MissingSkills
                });
            }

            // Sort by match score (descending) and then by creation date
            return matchedJobs
                .OrderByDescending(m => m.MatchScore)
                .ThenByDescending(m => m.Job.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList();
        }

        public async Task<JobMatchScore> CalculateMatchScoreAsync(int jobId, int studentId)
        {
            var job = await _context.JobPostings.FindAsync(jobId);
            if (job == null)
            {
                return new JobMatchScore { Score = 0 };
            }

            // Get student skills with proficiency levels
            var studentSkills = await _context.StudentSkills
                .Where(s => s.StudentId == studentId)
                .ToListAsync();

            if (studentSkills.Count == 0 || string.IsNullOrEmpty(job.RequiredSkills))
            {
                return new JobMatchScore
                {
                    Score = 0,
                    MatchedSkillsCount = 0,
                    TotalRequiredSkills = 0,
                    MatchedSkills = new List<string>(),
                    MissingSkills = new List<string>()
                };
            }

            // Parse required skills from job (comma-separated or newline-separated)
            var requiredSkills = job.RequiredSkills
                .Split(new[] { ',', '\n', ';', '|' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().ToLower())
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct()
                .ToList();

            if (requiredSkills.Count == 0)
            {
                return new JobMatchScore
                {
                    Score = 0,
                    MatchedSkillsCount = 0,
                    TotalRequiredSkills = 0,
                    MatchedSkills = new List<string>(),
                    MissingSkills = new List<string>()
                };
            }

            // Create a dictionary of student skills (lowercase for comparison)
            var studentSkillsDict = studentSkills.ToDictionary(
                s => s.SkillName.ToLower(),
                s => s.ProficiencyLevel
            );

            var matchedSkills = new List<string>();
            var missingSkills = new List<string>();
            double totalScore = 0;

            foreach (var requiredSkill in requiredSkills)
            {
                // Check for exact match
                if (studentSkillsDict.ContainsKey(requiredSkill))
                {
                    matchedSkills.Add(requiredSkill);
                    // Add proficiency bonus (Expert = 1.0, Advanced = 0.8, Intermediate = 0.6, Beginner = 0.4)
                    var proficiencyMultiplier = studentSkillsDict[requiredSkill] switch
                    {
                        ProficiencyLevel.Expert => 1.0,
                        ProficiencyLevel.Advanced => 0.8,
                        ProficiencyLevel.Intermediate => 0.6,
                        ProficiencyLevel.Beginner => 0.4,
                        _ => 0.5
                    };
                    totalScore += proficiencyMultiplier;
                }
                else
                {
                    // Check for partial match (contains)
                    var partialMatch = studentSkillsDict.Keys.FirstOrDefault(
                        studentSkill => studentSkill.Contains(requiredSkill) || requiredSkill.Contains(studentSkill)
                    );

                    if (partialMatch != null)
                    {
                        matchedSkills.Add($"{requiredSkill} (similar: {partialMatch})");
                        var proficiencyMultiplier = studentSkillsDict[partialMatch] switch
                        {
                            ProficiencyLevel.Expert => 0.7,
                            ProficiencyLevel.Advanced => 0.6,
                            ProficiencyLevel.Intermediate => 0.5,
                            ProficiencyLevel.Beginner => 0.3,
                            _ => 0.4
                        };
                        totalScore += proficiencyMultiplier * 0.7; // 70% weight for partial match
                    }
                    else
                    {
                        missingSkills.Add(requiredSkill);
                    }
                }
            }

            // Calculate final match score (0-100)
            // Base score: (matched skills / total required skills) * 100
            // Proficiency bonus: already included in totalScore
            var baseScore = requiredSkills.Count > 0 
                ? (matchedSkills.Count / (double)requiredSkills.Count) * 100 
                : 0;

            // Combine base score with proficiency bonus
            var proficiencyBonus = requiredSkills.Count > 0 
                ? (totalScore / requiredSkills.Count) * 20 // Max 20 points for proficiency
                : 0;

            var finalScore = Math.Min(100, baseScore + proficiencyBonus);

            return new JobMatchScore
            {
                Score = Math.Round(finalScore, 2),
                MatchedSkillsCount = matchedSkills.Count,
                TotalRequiredSkills = requiredSkills.Count,
                MatchedSkills = matchedSkills,
                MissingSkills = missingSkills
            };
        }
    }
}

