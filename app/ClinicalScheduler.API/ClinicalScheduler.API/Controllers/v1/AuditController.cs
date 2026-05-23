using Asp.Versioning;
using ClinicalScheduler.Application.AuditLog.Queries.GetAuditLog;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicalScheduler.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetLog(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string? category,
        CancellationToken ct)
        => Ok(await mediator.Send(new GetAuditLogQuery(from.ToUniversalTime(), to.ToUniversalTime(), category), ct));
}