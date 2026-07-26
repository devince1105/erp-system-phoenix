using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Modules.HR.Data;
using ERP.Modules.HR.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Modules.HR.Controllers
{
    [ApiController]
    [Route("api/hr/[controller]")]
    public class CalendarEventsController : ControllerBase
    {
        private readonly HRDbContext _context;

        public CalendarEventsController(HRDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetCalendarEvents()
        {
            return await _context.CalendarEvents.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<CalendarEvent>> CreateCalendarEvent(CalendarEvent calendarEvent)
        {
            _context.CalendarEvents.Add(calendarEvent);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCalendarEvents), new { id = calendarEvent.Id }, calendarEvent);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCalendarEvent(int id)
        {
            var calendarEvent = await _context.CalendarEvents.FindAsync(id);
            if (calendarEvent == null)
            {
                return NotFound();
            }

            _context.CalendarEvents.Remove(calendarEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
