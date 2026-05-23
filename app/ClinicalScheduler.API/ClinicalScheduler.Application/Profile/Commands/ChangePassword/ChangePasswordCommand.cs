using MediatR;

namespace ClinicalScheduler.Application.Profile.Commands.ChangePassword;

public record ChangePasswordCommand(int StaffId, string CurrentPassword, string NewPassword) : IRequest;