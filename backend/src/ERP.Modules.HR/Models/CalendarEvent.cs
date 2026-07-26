using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Modules.HR.Models
{
    public class CalendarEvent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(10)]
        public string Date { get; set; } // Format: YYYY-MM-DD

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; } // e.g. "Announcement", "Note"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
