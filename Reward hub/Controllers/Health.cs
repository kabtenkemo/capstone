using Microsoft.AspNetCore.Mvc;
using Reward_hub.Models;
using System;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly RewardHubContext  _context;

    public HealthController(RewardHubContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetHealth()
    {
        try
        {
            // محاولة عمل استعلام بسيط للتأكد من اتصال قاعدة البيانات
            var canConnect = _context.Database.CanConnect();

            return Ok(new
            {
                Status = "Healthy",
                Database = canConnect ? "Connected" : "Disconnected",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { Status = "Unhealthy", Error = ex.Message });
        }
    }
}