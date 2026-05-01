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

    public virtual DbSet<PointHistory> PointHistories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=(localdb)\\kemo;Database=RewardHub;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Classes__CB1927A0FF7590BF");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__Comments__C3B4DFCAE3721CEF");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Author).WithMany(p => p.CommentAuthors)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_comment_author");

            entity.HasOne(d => d.TargetUser).WithMany(p => p.CommentTargetUsers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_comment_target");
        });

        modelBuilder.Entity<Level>(entity =>
        {
            entity.HasKey(e => e.LevelId).HasName("PK__Levels__09F03C0691AF0FB0");

            entity.Property(e => e.LevelId).ValueGeneratedNever();
        });

        modelBuilder.Entity<PointHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__PointHis__4D7B4ABD9C4CCA28");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Student).WithMany(p => p.PointHistoryStudents)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_points_student");

            entity.HasOne(d => d.Teacher).WithMany(p => p.PointHistoryTeachers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_points_teacher");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C593935B0");

            entity.Property(e => e.LevelId).HasDefaultValue(1);
            entity.Property(e => e.Points).HasDefaultValue(0);
            entity.Property(e => e.UserRole).HasDefaultValue("Student");

            entity.HasOne(d => d.Class).WithMany(p => p.Users).HasConstraintName("fk_class");

            entity.HasOne(d => d.Level).WithMany(p => p.Users).HasConstraintName("fk_level");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("fk_parent");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
