using Asp.Versioning;
using ClinicalScheduler.Application.Overtime.Queries.GetOvertimeReport;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicalScheduler.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Admin,DepartmentLead,ChargeNurse")]
public class OvertimeController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken ct)
        => Ok(await mediator.Send(new GetOvertimeReportQuery(from.ToUniversalTime(), to.ToUniversalTime()), ct));
}