using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.Accounting.Models;

public class SystemSetting
{
    [Key]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;
}
