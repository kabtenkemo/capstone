using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Reward_hub.Models;

[Index("Email", Name = "UQ__Users__A9D10534DDFD347E", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("UserID")]
    public int UserId { get; set; }

    [StringLength(50)]
    public string Username { get; set; } = null!;

    [StringLength(100)]
    public string Email { get; set; } = null!;

    [StringLength(20)]
    public string? UserRole { get; set; }

    public int? Points { get; set; }

    [Column("LevelID")]
    public int? LevelId { get; set; }

    [Column("ClassID")]
    public int? ClassId { get; set; }

    [StringLength(512)]
    public string PasswordHash { get; set; } = null!;

    [ForeignKey("ClassId")]
    [InverseProperty("Users")]
    public virtual Class? Class { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    [ForeignKey("LevelId")]
    [InverseProperty("Users")]
    public virtual Level? Level { get; set; }
}
