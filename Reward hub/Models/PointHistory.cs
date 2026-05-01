using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Reward_hub.Models;

[Table("PointHistory")]
public partial class PointHistory
{
    [Key]
    public int HistoryId { get; set; }

    public int StudentId { get; set; }

    public int TeacherId { get; set; }

    public int Amount { get; set; }

    public string Reason { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("StudentId")]
    [InverseProperty("PointHistoryStudents")]
    public virtual User Student { get; set; } = null!;

    [ForeignKey("TeacherId")]
    [InverseProperty("PointHistoryTeachers")]
    public virtual User Teacher { get; set; } = null!;
}
