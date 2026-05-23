using System.Security.Claims;
using Asp.Versioning;
using ClinicalScheduler.API.Hubs;
using ClinicalScheduler.Application.Leaves.Commands.CancelLeave;
using ClinicalScheduler.Application.Leaves.Commands.ReviewLeave;
using ClinicalScheduler.Application.Leaves.Commands.SubmitLeave;
using ClinicalScheduler.Application.Leaves.Dtos;
using ClinicalScheduler.Application.Leaves.Queries.GetApprovedLeaves;
using ClinicalScheduler.Application.Leaves.Queries.GetLeaveRequests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ClinicalScheduler.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class LeavesController(IMediator mediator, IHubContext<ScheduleHub> hub) : ControllerBase
{
    private int CallerId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private int CallerDeptId => int.Parse(User.FindFirstValue("departmentId")!);
    private string CallerRole => User.FindFirstValue(ClaimTypes.Role)!;
    private string CallerName => User.FindFirstValue("fullName")!;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await mediator.Send(
            new GetLeaveRequestsQuery(CallerId, CallerDeptId, CallerRole), ct);
        return Ok(result);
    }

    [HttpGet("approved")]
    public async Task<IActionResult> GetApproved([FromQuery] DateOnly from, [FromQuery] DateOnly to, CancellationToken ct)
    {
        var result = await mediator.Send(new GetApprovedLeavesQuery(from, to), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitLeaveRequest body, CancellationToken ct)
    {
        if (CallerRole == "Admin")
            return Forbid();

        var result = await mediator.Send(
            new SubmitLeaveCommand(CallerId, body.LeaveType, body.StartDate, body.EndDate, body.Reason), ct);
        await hub.Clients.Group("role:reviewer").SendAsync(
            "LeaveSubmitted", new { staffName = result.StaffFullName, leaveType = result.LeaveType }, ct);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:int}/review")]
    public async Task<IActionResult> Review(int id, [FromBody] ReviewLeaveRequest body, CancellationToken ct)
    {
        if (CallerRole is not ("Admin" or "DepartmentLead" or "ChargeNurse"))
            return Forbid();

        var result = await mediator.Send(
            new ReviewLeaveCommand(id, CallerId, CallerName, body.Action, body.Note), ct);
        await hub.Clients.Group($"user:{result.StaffId}").SendAsync(
            "LeaveReviewed", new { status = result.Status, leaveType = result.LeaveType }, ct);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await mediator.Send(new CancelLeaveCommand(id, CallerId), ct);
        return NoContent();
    }
}

public record SubmitLeaveRequest(string LeaveType, DateOnly StartDate, DateOnly EndDate, string Reason);
public record ReviewLeaveRequest(string Action, string? Note);