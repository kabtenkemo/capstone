using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Reward_hub.Models;

public partial class RewardHubContext : DbContext
{
    public RewardHubContext()
    {
    }

    public RewardHubContext(DbContextOptions<RewardHubContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Class> Classes { get; set; }
    public virtual DbSet<Comment> Comments { get; set; }
    public virtual DbSet<Level> Levels { get; set; }
    public virtual DbSet<User> Users { get; set; }

    // تم حذف ميثود OnConfiguring هنا لأننا نستخدم AddDbContext في Program.cs

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Classes__CB1927A0C2031D97");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__Comments__C3B4DFAA80B87416");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithMany(p => p.Comments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user");
        });

        modelBuilder.Entity<Level>(entity =>
        {
            entity.HasKey(e => e.LevelId).HasName("PK__Levels__09F03C061B550A37");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCACF7C0960E");

            entity.Property(e => e.LevelId).HasDefaultValue(1);
            entity.Property(e => e.PasswordHash).HasDefaultValue("PENDING_PASSWORD");
            entity.Property(e => e.Points).HasDefaultValue(0);
            entity.Property(e => e.UserRole).HasDefaultValue("Student");

            entity.HasOne(d => d.Class).WithMany(p => p.Users).HasConstraintName("fk_class");
            entity.HasOne(d => d.Level).WithMany(p => p.Users).HasConstraintName("fk_level");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}