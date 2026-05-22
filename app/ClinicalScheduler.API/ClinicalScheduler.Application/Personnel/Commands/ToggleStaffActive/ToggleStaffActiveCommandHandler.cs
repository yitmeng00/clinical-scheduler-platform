using ClinicalScheduler.Application.Common.Exceptions;
using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Application.Personnel.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Personnel.Commands.ToggleStaffActive;

public class ToggleStaffActiveCommandHandler(IApplicationDbContext context)
    : IRequestHandler<ToggleStaffActiveCommand, StaffMemberDto>
{
    public async Task<StaffMemberDto> Handle(ToggleStaffActiveCommand request, CancellationToken cancellationToken)
    {
        var staff = await context.Staff
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Staff", request.Id);

        staff.IsActive = !staff.IsActive;
        await context.SaveChangesAsync(cancellationToken);

        return new StaffMemberDto(
            staff.Id, staff.FullName, staff.Email, staff.Initials,
            staff.Role.ToString(), staff.DepartmentId, staff.Department.Name,
            staff.IsActive, staff.Phone, staff.EmploymentType.ToString(), staff.CreatedAt);
    }
}