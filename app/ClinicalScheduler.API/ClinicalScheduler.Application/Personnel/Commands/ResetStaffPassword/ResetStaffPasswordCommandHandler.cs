using ClinicalScheduler.Application.Common.Exceptions;
using ClinicalScheduler.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Personnel.Commands.ResetStaffPassword;

public class ResetStaffPasswordCommandHandler(IApplicationDbContext context, IPasswordHasher hasher)
    : IRequestHandler<ResetStaffPasswordCommand>
{
    public async Task Handle(ResetStaffPasswordCommand request, CancellationToken cancellationToken)
    {
        var staff = await context.Staff
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Staff", request.Id);

        staff.PasswordHash = hasher.Hash(request.NewPassword);
        await context.SaveChangesAsync(cancellationToken);
    }
}