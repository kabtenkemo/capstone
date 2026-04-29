using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Reward_hub.Models;

public partial class Level
{
    [Key]
    [Column("LevelID")]
    public int LevelId { get; set; }

    [StringLength(50)]
    public string LevelName { get; set; } = null!;

    public int RequiredPoints { get; set; }

    [InverseProperty("Level")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
