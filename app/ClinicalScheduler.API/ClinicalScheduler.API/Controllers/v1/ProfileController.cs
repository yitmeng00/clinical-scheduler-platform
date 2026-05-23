using System.Security.Claims;
using Asp.Versioning;
using ClinicalScheduler.Application.Profile.Commands.ChangePassword;
using ClinicalScheduler.Application.Profile.Queries.GetMyProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicalScheduler.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class ProfileController(IMediator mediator) : ControllerBase
{
    private int CallerId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
        => Ok(await mediator.Send(new GetMyProfileQuery(CallerId), ct));

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordBody body,
        CancellationToken ct)
    {
        await mediator.Send(new ChangePasswordCommand(CallerId, body.CurrentPassword, body.NewPassword), ct);
        return NoContent();
    }
}

public record ChangePasswordBody(string CurrentPassword, string NewPassword);