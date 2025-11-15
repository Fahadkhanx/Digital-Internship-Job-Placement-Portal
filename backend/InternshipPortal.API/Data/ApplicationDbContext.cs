using Microsoft.EntityFrameworkCore;
using InternshipPortal.API.Models;

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
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SystemLog> SystemLogs { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.UserType).HasConversion<string>();
            });

            // Student configuration
            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasKey(e => e.StudentId);
                entity.HasOne(e => e.User)
                      .WithOne()
                      .HasForeignKey<Student>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Education configuration
            modelBuilder.Entity<Education>(entity =>
            {
                entity.HasKey(e => e.EducationId);
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // StudentSkill configuration
            modelBuilder.Entity<StudentSkill>(entity =>
            {
                entity.HasKey(e => e.SkillId);
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Employer configuration
            modelBuilder.Entity<Employer>(entity =>
            {
                entity.HasKey(e => e.EmployerId);
                entity.HasOne(e => e.User)
                      .WithOne()
                      .HasForeignKey<Employer>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.Property(e => e.VerificationStatus).HasConversion<string>();
            });

            // JobPosting configuration
            modelBuilder.Entity<JobPosting>(entity =>
            {
                entity.HasKey(e => e.JobId);
                entity.HasOne(e => e.Employer)
                      .WithMany()
                      .HasForeignKey(e => e.EmployerId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.Property(e => e.JobType).HasConversion<string>();
                entity.Property(e => e.ExperienceLevel).HasConversion<string>();
            });

            // Application configuration
            modelBuilder.Entity<Application>(entity =>
            {
                entity.HasKey(e => e.ApplicationId);
                entity.HasOne(e => e.Job)
                      .WithMany()
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Student)
                      .WithMany()
                      .HasForeignKey(e => e.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => new { e.JobId, e.StudentId }).IsUnique();
                entity.Property(e => e.Status).HasConversion<string>();
            });

            // Bookmark configuration
            modelBuilder.Entity<Bookmark>(entity =>
            {
                entity.HasKey(e => e.BookmarkId);
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
                entity.HasKey(e => e.MessageId);
                entity.HasOne(e => e.Sender)
                      .WithMany()
                      .HasForeignKey(e => e.SenderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Receiver)
                      .WithMany()
                      .HasForeignKey(e => e.ReceiverId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Notification configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.NotificationId);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
