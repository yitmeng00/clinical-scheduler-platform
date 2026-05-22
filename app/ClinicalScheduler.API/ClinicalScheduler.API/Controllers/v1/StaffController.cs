using Asp.Versioning;
using ClinicalScheduler.Application.Personnel.Commands.CreateStaff;
using ClinicalScheduler.Application.Personnel.Commands.ResetStaffPassword;
using ClinicalScheduler.Application.Personnel.Commands.ToggleStaffActive;
using ClinicalScheduler.Application.Personnel.Commands.UpdateStaff;
using ClinicalScheduler.Application.Personnel.Queries.GetStaffList;
using ClinicalScheduler.Application.Personnel.Queries.GetStaffManagementList;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicalScheduler.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class StaffController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken ct)
        => Ok(await mediator.Send(new GetStaffListQuery(), ct));

    [HttpGet("management")]
    [Authorize(Roles = "Admin,DepartmentLead")]
    public async Task<IActionResult> GetManagementList(CancellationToken ct)
        => Ok(await mediator.Send(new GetStaffManagementListQuery(), ct));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateStaffCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetManagementList), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffBody body, CancellationToken ct)
        => Ok(await mediator.Send(new UpdateStaffCommand(
            id, body.FullName, body.Email, body.Role, body.DepartmentId, body.Phone, body.EmploymentType), ct));

    [HttpPatch("{id:int}/toggle-active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleActive(int id, CancellationToken ct)
        => Ok(await mediator.Send(new ToggleStaffActiveCommand(id), ct));

    [HttpPost("{id:int}/reset-password")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordBody body, CancellationToken ct)
    {
        await mediator.Send(new ResetStaffPasswordCommand(id, body.NewPassword), ct);
        return NoContent();
    }
}

public record UpdateStaffBody(
    string FullName,
    string Email,
    string Role,
    int DepartmentId,
    string? Phone,
    string EmploymentType);

public record ResetPasswordBody(string NewPassword);