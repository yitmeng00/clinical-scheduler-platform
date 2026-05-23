using ClinicalScheduler.Application.Common.Exceptions;
using ClinicalScheduler.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Profile.Commands.ChangePassword;

public class ChangePasswordCommandHandler(IApplicationDbContext context, IPasswordHasher hasher)
    : IRequestHandler<ChangePasswordCommand>
{
    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var staff = await context.Staff
            .FirstOrDefaultAsync(s => s.Id == request.StaffId, cancellationToken)
            ?? throw new NotFoundException("Staff", request.StaffId);

        if (!hasher.Verify(request.CurrentPassword, staff.PasswordHash))
            throw new UnauthorizedException("Current password is incorrect.");

        if (request.NewPassword.Length < 6)
            throw new ConflictException("New password must be at least 6 characters.");

        staff.PasswordHash = hasher.Hash(request.NewPassword);
        await context.SaveChangesAsync(cancellationToken);
    }
}