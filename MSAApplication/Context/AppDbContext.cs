using Microsoft.EntityFrameworkCore;
using MSAApplication.Models;

namespace MSAApplication.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<UserSkill> UserSkills { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired();
                entity.Property(u => u.Bio).HasMaxLength(500);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");
                entity.HasIndex(u=>u.SupabaseUserId).IsUnique();
            });

            // Skill configuration
            modelBuilder.Entity<Skill>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.HasIndex(s => s.SkillName).IsUnique();
                entity.Property(s => s.SkillName).IsRequired().HasMaxLength(100);
                entity.Property(s => s.Category).HasMaxLength(50);
                entity.Property(s => s.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // UserSkill configuration (Many-to-Many with additional properties)
            modelBuilder.Entity<UserSkill>(entity =>
            {
                entity.HasKey(us => us.Id);

                // Composite unique index to prevent duplicate user-skill-type combinations
                entity.HasIndex(us => new { us.UserId, us.SkillId, us.SkillType }).IsUnique();

                entity.HasOne(us => us.User)
                    .WithMany(u => u.UserSkills)
                    .HasForeignKey(us => us.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(us => us.Skill)
                    .WithMany(s => s.UserSkills)
                    .HasForeignKey(us => us.SkillId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(us => us.ProficiencyLevel).IsRequired();
                entity.Property(us => us.SkillType).IsRequired();
                entity.Property(us => us.Notes).HasMaxLength(200);
                entity.Property(us => us.CreatedAt).HasDefaultValueSql("NOW()");
            });
        }
    }
}