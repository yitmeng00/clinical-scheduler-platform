using Asp.Versioning;
using ClinicalScheduler.API.Hubs;
using ClinicalScheduler.Application.Shifts.Commands.CreateShift;
using ClinicalScheduler.Application.Shifts.Commands.DeleteShift;
using ClinicalScheduler.Application.Shifts.Commands.UpdateShift;
using ClinicalScheduler.Application.Shifts.Queries.GetShiftsByWeek;
using ClinicalScheduler.Application.Shifts.Queries.GetUpcomingShifts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ClinicalScheduler.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class ShiftsController(IMediator mediator, IHubContext<ScheduleHub> hub) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetByWeek(
        [FromQuery] DateOnly? weekStart,
        [FromQuery] DateOnly? monthStart,
        [FromQuery] int? departmentId,
        CancellationToken ct)
    {
        var effectiveWeekStart = weekStart ?? DateOnly.FromDateTime(DateTime.UtcNow);
        return Ok(await mediator.Send(new GetShiftsByWeekQuery(effectiveWeekStart, departmentId, monthStart), ct));
    }

    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcoming([FromQuery] int staffId, CancellationToken ct) =>
        Ok(await mediator.Send(new GetUpcomingShiftsQuery(staffId), ct));

    [HttpPost]
    [Authorize(Roles = "Admin,DepartmentLead")]
    public async Task<IActionResult> Create([FromBody] CreateShiftCommand command, CancellationToken ct)
    {
        var dto = await mediator.Send(command, ct);
        await hub.Clients.Group($"dept:{dto.DepartmentName}").SendAsync("ShiftCreated", dto, ct);
        await hub.Clients.Group($"user:{dto.StaffId}").SendAsync("ShiftAssigned", new { shiftType = dto.ShiftType, startTime = dto.StartTime }, ct);
        return CreatedAtAction(nameof(GetByWeek), new { weekStart = DateOnly.FromDateTime(dto.StartTime) }, dto);
    }

    [HttpPatch("{id:int}")]
    [Authorize(Roles = "Admin,DepartmentLead")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateShiftRequest request, CancellationToken ct)
    {
        var dto = await mediator.Send(new UpdateShiftCommand(id, request.NewDate), ct);
        await hub.Clients.Group($"dept:{dto.DepartmentName}").SendAsync("ShiftUpdated", dto, ct);
        await hub.Clients.Group($"user:{dto.StaffId}").SendAsync("ShiftRescheduled", new { shiftType = dto.ShiftType, startTime = dto.StartTime }, ct);
        return Ok(dto);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,DepartmentLead")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var info = await mediator.Send(new DeleteShiftCommand(id), ct);
        await hub.Clients.Group($"dept:{info.DepartmentName}").SendAsync("ShiftDeleted", new { id, staffId = info.StaffId }, ct);
        await hub.Clients.Group($"user:{info.StaffId}").SendAsync("ShiftRemoved", new { }, ct);
        return NoContent();
    }
}

public record UpdateShiftRequest(DateOnly NewDate);