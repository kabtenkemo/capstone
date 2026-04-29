using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Reward_hub.Models;

public partial class Class
{
    [Key]
    [Column("ClassID")]
    public int ClassId { get; set; }

    [StringLength(100)]
    public string ClassName { get; set; } = null!;

    [InverseProperty("Class")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
