using Microsoft.AspNetCore.Mvc;

namespace ERP.Modules.HR.Controllers
{
    [ApiController]
    [Route("api/hr/[controller]")]
    public class ApprovalsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetApprovals([FromQuery] string? type)
        {
            // TODO: Implement actual approval workflow. 
            // Currently returning empty list to prevent frontend 404 errors on Personal Portal.
            return Ok(new object[] { });
        }

        [HttpGet("{id}")]
        public IActionResult GetApproval(int id)
        {
            return NotFound();
        }

        [HttpPost]
        public IActionResult CreateApproval([FromBody] object request)
        {
            return Ok(request);
        }

        [HttpPost("{id}/process")]
        public IActionResult ProcessApproval(int id, [FromBody] object payload)
        {
            return Ok();
        }
    }
}
