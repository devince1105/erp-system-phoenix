using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.HR.Models;

public class HrParameterSetting
{
    [Key]
    public int Id { get; set; }
    
    [MaxLength(50)]
    public string SettingGroup { get; set; } = string.Empty; // e.g. "LeaveMultiplier", "InsuranceBracket"
    
    [MaxLength(50)]
    public string Key { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string Value { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
