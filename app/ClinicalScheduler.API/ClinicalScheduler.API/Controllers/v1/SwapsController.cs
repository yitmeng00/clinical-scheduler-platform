using System.Security.Claims;
using Asp.Versioning;
using ClinicalScheduler.API.Hubs;
using ClinicalScheduler.Application.Swaps.Commands.Cancel;
using ClinicalScheduler.Application.Swaps.Commands.Respond;
using ClinicalScheduler.Application.Swaps.Commands.Review;
using ClinicalScheduler.Application.Swaps.Commands.Submit;
using ClinicalScheduler.Application.Swaps.Queries.GetSwapRequests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ClinicalScheduler.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class SwapsController(IMediator mediator, IHubContext<ScheduleHub> hub) : ControllerBase
{
    private int CallerId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private int CallerDeptId => int.Parse(User.FindFirstValue("departmentId")!);
    private string CallerRole => User.FindFirstValue(ClaimTypes.Role)!;
    private string CallerName => User.FindFirstValue("fullName")!;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await mediator.Send(new GetSwapRequestsQuery(CallerId, CallerDeptId, CallerRole), ct));

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitSwapRequest body, CancellationToken ct)
    {
        if (CallerRole == "Admin")
            return Forbid();

        var result = await mediator.Send(
            new SubmitSwapCommand(CallerId, CallerName, body.RequesterShiftId, body.RequesteeShiftId, body.Reason), ct);
        await hub.Clients.Group($"user:{result.RequesteeId}").SendAsync(
            "SwapRequested", new { requesterName = result.RequesterName }, ct);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:int}/respond")]
    public async Task<IActionResult> Respond(int id, [FromBody] RespondSwapRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(
            new RespondSwapCommand(id, CallerId, CallerName, body.Action, body.Note), ct);
        if (result.Status == "PendingAdmin")
            await hub.Clients.Group("role:reviewer").SendAsync(
                "SwapResponded", new { requesteeName = result.RequesteeName }, ct);
        return Ok(result);
    }

    [HttpPut("{id:int}/review")]
    public async Task<IActionResult> Review(int id, [FromBody] ReviewSwapRequest body, CancellationToken ct)
    {
        if (CallerRole is not ("Admin" or "DepartmentLead" or "ChargeNurse"))
            return Forbid();

        var result = await mediator.Send(
            new ReviewSwapCommand(id, CallerId, CallerName, body.Action, body.Note), ct);
        var payload = new { status = result.Status, requesterName = result.RequesterName, requesteeName = result.RequesteeName };
        await hub.Clients.Group($"user:{result.RequesterId}").SendAsync("SwapReviewed", payload, ct);
        await hub.Clients.Group($"user:{result.RequesteeId}").SendAsync("SwapReviewed", payload, ct);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await mediator.Send(new CancelSwapCommand(id, CallerId, CallerName), ct);
        return NoContent();
    }
}

public record SubmitSwapRequest(int RequesterShiftId, int RequesteeShiftId, string Reason);
public record RespondSwapRequest(string Action, string? Note);
public record ReviewSwapRequest(string Action, string? Note);