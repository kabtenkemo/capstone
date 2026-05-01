using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Reward_hub.Models;

public partial class Comment
{
    [Key]
    public int CommentId { get; set; }

    public string Content { get; set; } = null!;

    public int AuthorId { get; set; }

    public int TargetUserId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("AuthorId")]
    [InverseProperty("CommentAuthors")]
    public virtual User Author { get; set; } = null!;

    [ForeignKey("TargetUserId")]
    [InverseProperty("CommentTargetUsers")]
    public virtual User TargetUser { get; set; } = null!;
}
