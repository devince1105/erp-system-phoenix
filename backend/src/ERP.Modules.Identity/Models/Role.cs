namespace ERP.Modules.Identity.Models;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // e.g. "Admin", "Accountant", "HR"
    
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
