using ClinicalScheduler.Application.Common.Exceptions;
using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Shifts.Commands.DeleteShift;

public class DeleteShiftCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteShiftCommand, DeletedShiftInfo>
{
    public async Task<DeletedShiftInfo> Handle(DeleteShiftCommand request, CancellationToken cancellationToken)
    {
        var shift = await context.Shifts
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Shift), request.Id);

        var info = new DeletedShiftInfo(shift.Id, shift.StaffId, shift.Department.Name);

        context.Shifts.Remove(shift);
        await context.SaveChangesAsync(cancellationToken);

        return info;
    }
}
