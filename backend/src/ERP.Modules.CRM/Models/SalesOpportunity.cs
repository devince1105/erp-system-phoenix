using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.Modules.CRM.Models;

public class SalesOpportunity
{
    public int Id { get; set; }
    
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public decimal EstimatedValue { get; set; }
    
    [MaxLength(50)]
    public string Stage { get; set; } = "Lead"; // Lead, Contacted, Proposal, Negotiation, Won, Lost
    
    public DateTime? ExpectedCloseDate { get; set; }
    
    public string Notes { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
