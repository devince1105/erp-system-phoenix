using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.Inventory.Domain.Entities;

/// <summary>
/// 實體倉庫 (Warehouse)
/// </summary>
public class Warehouse
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty; // e.g. WH-TPE, WH-TXG, WH-KHH

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty; // e.g. 台北總倉, 台中物流中心

    [MaxLength(255)]
    public string? Address { get; set; }

    [MaxLength(50)]
    public string? ContactPerson { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    /// <summary>是否為系統預設倉庫（進出貨未指定時使用）</summary>
    public bool IsDefault { get; set; }

    /// <summary>啟用狀態</summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
