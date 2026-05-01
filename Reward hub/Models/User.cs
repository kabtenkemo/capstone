using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Reward_hub.Models;

[Index("Email", Name = "UQ__Users__A9D105346567B8AC", IsUnique = true)]
public partial class User
{
    [Key]
    public int UserId { get; set; }

    [StringLength(100)]
    public string Username { get; set; } = null!;

    [StringLength(255)]
    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public int? Points { get; set; }

    [StringLength(20)]
    public string? UserRole { get; set; }

    public int? ClassId { get; set; }

    public int? LevelId { get; set; }

    public int? ParentId { get; set; }

    [ForeignKey("ClassId")]
    [InverseProperty("Users")]
    public virtual Class? Class { get; set; }

    [InverseProperty("Author")]
    public virtual ICollection<Comment> CommentAuthors { get; set; } = new List<Comment>();

    [InverseProperty("TargetUser")]
    public virtual ICollection<Comment> CommentTargetUsers { get; set; } = new List<Comment>();

    [InverseProperty("Parent")]
    public virtual ICollection<User> InverseParent { get; set; } = new List<User>();

    [ForeignKey("LevelId")]
    [InverseProperty("Users")]
    public virtual Level? Level { get; set; }

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual User? Parent { get; set; }

    [InverseProperty("Student")]
    public virtual ICollection<PointHistory> PointHistoryStudents { get; set; } = new List<PointHistory>();

    [InverseProperty("Teacher")]
    public virtual ICollection<PointHistory> PointHistoryTeachers { get; set; } = new List<PointHistory>();
}
