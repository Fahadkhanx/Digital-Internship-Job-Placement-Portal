using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InternshipPortal.API.Data;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HealthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetHealth()
        {
            try
            {
                // Test database connection
                var canConnect = await _context.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    return StatusCode(503, new
                    {
                        status = "Unhealthy",
                        message = "Database connection failed",
                        timestamp = DateTime.UtcNow
                    });
                }

                // Get database info
                var databaseName = _context.Database.GetDbConnection().Database;
                
                return Ok(new
                {
                    status = "Healthy",
                    message = "API is running and database is connected",
                    database = databaseName,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(503, new
                {
                    status = "Unhealthy",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
    }
}

