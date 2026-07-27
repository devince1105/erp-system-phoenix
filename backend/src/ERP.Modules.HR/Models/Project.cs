using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.HR.Models;

public enum ProjectStatus
{
    Planning = 0,
    Active = 1,
    Completed = 2,
    OnHold = 3,
    Cancelled = 4
}

public class Project
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public int? DepartmentId { get; set; }
    [ForeignKey("DepartmentId")]
    public Department? Department { get; set; }
    
    public int? ManagerId { get; set; }
    [ForeignKey("ManagerId")]
    public Employee? Manager { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Budget { get; set; }
    
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
