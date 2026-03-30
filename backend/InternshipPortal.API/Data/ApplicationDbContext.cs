using Microsoft.EntityFrameworkCore;
using InternshipPortal.API.Models;
using InternshipPortal.API.Data.Converters;

namespace InternshipPortal.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Education> Education { get; set; }
        public DbSet<StudentSkill> StudentSkills { get; set; }
        public DbSet<Employer> Employers { get; set; }
        public DbSet<JobPosting> JobPostings { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SystemLog> SystemLogs { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
                entity.Property(e => e.UserType)
                      .HasColumnName("user_type")
                      .HasConversion(
                          v => v.ToString().ToLower(),
                          v => (UserType)Enum.Parse(typeof(UserType), v, true)
                      );
                entity.Property(e => e.IsVerified).HasColumnName("is_verified");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                entity.Property(e => e.IsBanned).HasColumnName("is_banned");
                entity.Property(e => e.BannedUntil).HasColumnName("banned_until");
                entity.Property(e => e.BanReason).HasColumnName("ban_reason");
                entity.Property(e => e.VerificationCode).HasColumnName("verification_code");
                entity.Property(e => e.VerificationCodeExpiresAt).HasColumnName("verification_code_expires_at");
                entity.Property(e => e.VerificationAttempts).HasColumnName("verification_attempts");
                entity.Property(e => e.LastVerificationAttemptAt).HasColumnName("last_verification_attempt_at");
                entity.Property(e => e.ResendCodeAttempts).HasColumnName("resend_code_attempts");
                entity.Property(e => e.LastResendCodeAt).HasColumnName("last_resend_code_at");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Student configuration
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("students");
                entity.HasKey(e => e.StudentId);
                entity.Property(e => e.StudentId).HasColumnName("student_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.FirstName).HasColumnName("first_name");
                entity.Property(e => e.LastName).HasColumnName("last_name");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
                entity.Property(e => e.Address).HasColumnName("address");
                entity.Property(e => e.City).HasColumnName("city");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.ResumeUrl).HasColumnName("resume_url");
                entity.Property(e => e.ProfilePictureUrl).HasColumnName("profile_picture_url");
                entity.Property(e => e.Bio).HasColumnName("bio");
                entity.HasOne(e => e.User)
                      .WithOne()
                      .HasForeignKey<Student>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Education configuration
            modelBuilder.Entity<Education>(entity =>
            {
                entity.ToTable("education");
                entity.HasKey(e => e.EducationId);
                entity.Property(e => e.EducationId).HasColumnName("education_id");
                entity.Property(e => e.StudentId).HasColumnName("student_id");
                entity.Property(e => e.InstitutionName).HasColumnName("institution_name");
                entity.Property(e => e.Degree).HasColumnName("degree");
                entity.Property(e => e.FieldOfStudy).HasColumnName("field_of_study");
                entity.Property(e => e.StartDate).HasColumnName("start_date");
                entity.Property(e => e.EndDate).HasColumnName("end_date");
                entity.Property(e => e.Gpa).HasColumnName("gpa");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // StudentSkill configuration
            modelBuilder.Entity<StudentSkill>(entity =>
            {
                entity.ToTable("student_skills");
                entity.HasKey(e => e.SkillId);
                entity.Property(e => e.SkillId).HasColumnName("skill_id");
                entity.Property(e => e.StudentId).HasColumnName("student_id");
                entity.Property(e => e.SkillName).HasColumnName("skill_name");
                entity.Property(e => e.ProficiencyLevel)
                      .HasColumnName("proficiency_level")
                      .HasConversion(
                          v => v.ToString().ToLower(),
                          v => (ProficiencyLevel)Enum.Parse(typeof(ProficiencyLevel), v, true)
                      );
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Employer configuration
            modelBuilder.Entity<Employer>(entity =>
            {
                entity.ToTable("employers");
                entity.HasKey(e => e.EmployerId);
                entity.Property(e => e.EmployerId).HasColumnName("employer_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.CompanyName).HasColumnName("company_name");
                entity.Property(e => e.CompanyDescription).HasColumnName("company_description");
                entity.Property(e => e.Industry).HasColumnName("industry");
                entity.Property(e => e.Website).HasColumnName("website");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Address).HasColumnName("address");
                entity.Property(e => e.City).HasColumnName("city");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.LogoUrl).HasColumnName("logo_url");
                entity.Property(e => e.VerificationStatus)
                      .HasColumnName("verification_status")
                      .HasConversion(
                          v => v.ToString().ToLower(),
                          v => (VerificationStatus)Enum.Parse(typeof(VerificationStatus), v, true)
                      );
                entity.Property(e => e.VerifiedBy).HasColumnName("verified_by");
                entity.Property(e => e.VerifiedAt).HasColumnName("verified_at");
                entity.HasOne(e => e.User)
                      .WithOne()
                      .HasForeignKey<Employer>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // JobPosting configuration
            modelBuilder.Entity<JobPosting>(entity =>
            {
                entity.ToTable("job_postings");
                entity.HasKey(e => e.JobId);
                entity.Property(e => e.JobId).HasColumnName("job_id");
                entity.Property(e => e.EmployerId).HasColumnName("employer_id");
                entity.Property(e => e.Title).HasColumnName("title");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.JobType)
                      .HasColumnName("job_type")
                      .HasConversion(new JobTypeConverter());
                entity.Property(e => e.Location).HasColumnName("location");
                entity.Property(e => e.RemoteOption).HasColumnName("remote_option");
                entity.Property(e => e.SalaryMin).HasColumnName("salary_min");
                entity.Property(e => e.SalaryMax).HasColumnName("salary_max");
                entity.Property(e => e.Currency).HasColumnName("currency");
                entity.Property(e => e.RequiredSkills).HasColumnName("required_skills");
                entity.Property(e => e.RequiredEducation).HasColumnName("required_education");
                entity.Property(e => e.ExperienceLevel)
                      .HasColumnName("experience_level")
                      .HasConversion(
                          v => v.ToString().ToLower(),
                          v => (ExperienceLevel)Enum.Parse(typeof(ExperienceLevel), v, true)
                      );
                entity.Property(e => e.ApplicationDeadline).HasColumnName("application_deadline");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.HasOne(e => e.Employer)
                      .WithMany()
                      .HasForeignKey(e => e.EmployerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Application configuration
            modelBuilder.Entity<Application>(entity =>
            {
                entity.ToTable("applications");
                entity.HasKey(e => e.ApplicationId);
                entity.Property(e => e.ApplicationId).HasColumnName("application_id");
                entity.Property(e => e.JobId).HasColumnName("job_id");
                entity.Property(e => e.StudentId).HasColumnName("student_id");
                entity.Property(e => e.CoverLetter).HasColumnName("cover_letter");
                entity.Property(e => e.Status)
                      .HasColumnName("status")
                      .HasConversion(
                          v => v.ToString().ToLower(),
                          v => (ApplicationStatus)Enum.Parse(typeof(ApplicationStatus), v, true)
                      );
                entity.Property(e => e.AppliedAt).HasColumnName("applied_at");
                entity.Property(e => e.ReviewedAt).HasColumnName("reviewed_at");
                entity.Property(e => e.Feedback).HasColumnName("feedback");
                entity.HasOne(e => e.Job)
                      .WithMany()
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => new { e.JobId, e.StudentId }).IsUnique();
            });

            // Bookmark configuration
            modelBuilder.Entity<Bookmark>(entity =>
            {
                entity.ToTable("bookmarks");
                entity.HasKey(e => e.BookmarkId);
                entity.Property(e => e.BookmarkId).HasColumnName("bookmark_id");
                entity.Property(e => e.StudentId).HasColumnName("student_id");
                entity.Property(e => e.JobId).HasColumnName("job_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Job)
                      .WithMany()
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => new { e.StudentId, e.JobId }).IsUnique();
            });

            // Message configuration
            modelBuilder.Entity<Message>(entity =>
            {
                entity.ToTable("messages");
                entity.HasKey(e => e.MessageId);
                entity.Property(e => e.MessageId).HasColumnName("message_id");
                entity.Property(e => e.ApplicationId).HasColumnName("application_id");
                entity.Property(e => e.SenderId).HasColumnName("sender_id");
                entity.Property(e => e.ReceiverId).HasColumnName("receiver_id");
                entity.Property(e => e.Subject).HasColumnName("subject");
                entity.Property(e => e.MessageText).HasColumnName("message_text");
                entity.Property(e => e.MessageType)
                      .HasColumnName("message_type")
                      .HasConversion(
                          v => v.ToString().ToLower(),
                          v => (MessageType)Enum.Parse(typeof(MessageType), v, true)
                      )
                      .HasDefaultValue(MessageType.Text);
                entity.Property(e => e.FileUrl).HasColumnName("file_url");
                entity.Property(e => e.FileName).HasColumnName("file_name");
                entity.Property(e => e.FileType).HasColumnName("file_type");
                entity.Property(e => e.FileSize).HasColumnName("file_size");
                entity.Property(e => e.IsRead).HasColumnName("is_read");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.HasOne(e => e.Sender)
                      .WithMany()
                      .HasForeignKey(e => e.SenderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Receiver)
                      .WithMany()
                      .HasForeignKey(e => e.ReceiverId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Meeting configuration
            modelBuilder.Entity<Meeting>(entity =>
            {
                entity.ToTable("meetings");
                entity.HasKey(e => e.MeetingId);
                entity.Property(e => e.MeetingId).HasColumnName("meeting_id");
                entity.Property(e => e.OrganizerId).HasColumnName("organizer_id");
                entity.Property(e => e.ParticipantId).HasColumnName("participant_id");
                entity.Property(e => e.Title).HasColumnName("title");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.ScheduledAt).HasColumnName("scheduled_at");
                entity.Property(e => e.DurationMinutes).HasColumnName("duration_minutes");
                entity.Property(e => e.Status)
                      .HasColumnName("status")
                      .HasConversion(new Converters.MeetingStatusConverter())
                      .HasDefaultValue(MeetingStatus.Scheduled);
                entity.Property(e => e.MeetingLink).HasColumnName("meeting_link");
                entity.Property(e => e.MeetingIdExternal).HasColumnName("meeting_id_external");
                entity.Property(e => e.ApplicationId).HasColumnName("application_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.HasOne(e => e.Organizer)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizerId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Participant)
                      .WithMany()
                      .HasForeignKey(e => e.ParticipantId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Application)
                      .WithMany()
                      .HasForeignKey(e => e.ApplicationId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Notification configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("notifications");
                entity.HasKey(e => e.NotificationId);
                entity.Property(e => e.NotificationId).HasColumnName("notification_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Type).HasColumnName("type");
                entity.Property(e => e.Title).HasColumnName("title");
                entity.Property(e => e.Message).HasColumnName("message");
                entity.Property(e => e.Link).HasColumnName("link");
                entity.Property(e => e.IsRead).HasColumnName("is_read");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // SystemLog configuration
            modelBuilder.Entity<SystemLog>(entity =>
            {
                entity.ToTable("system_logs");
                entity.HasKey(e => e.LogId);
                entity.Property(e => e.LogId).HasColumnName("log_id");
                entity.Property(e => e.AdminId).HasColumnName("admin_id");
                entity.Property(e => e.ActionType).HasColumnName("action_type");
                entity.Property(e => e.TargetUserId).HasColumnName("target_user_id");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            });

            // PasswordResetToken configuration
            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.ToTable("password_reset_tokens");
                entity.HasKey(e => e.TokenId);
                entity.Property(e => e.TokenId).HasColumnName("token_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Token).HasColumnName("token");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.Used).HasColumnName("used");
            });
        }
    }
}
