using MediatR;

namespace ClinicalScheduler.Application.Personnel.Commands.ResetStaffPassword;

public record ResetStaffPasswordCommand(int Id, string NewPassword) : IRequest;