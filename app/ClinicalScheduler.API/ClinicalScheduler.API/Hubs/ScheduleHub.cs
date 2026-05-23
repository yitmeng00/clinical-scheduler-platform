using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ClinicalScheduler.API.Hubs;

[Authorize]
public class ScheduleHub : Hub
{
    public async Task JoinDepartment(string departmentName)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"dept:{departmentName}");

    public async Task LeaveDepartment(string departmentName)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"dept:{departmentName}");

    public async Task JoinUserGroup(string userId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

    public async Task JoinReviewerGroup()
        => await Groups.AddToGroupAsync(Context.ConnectionId, "role:reviewer");
}
