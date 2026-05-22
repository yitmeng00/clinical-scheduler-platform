using ClinicalScheduler.Application.Common.Exceptions;
using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Application.Personnel.Dtos;
using ClinicalScheduler.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Personnel.Commands.UpdateStaff;

public class UpdateStaffCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateStaffCommand, StaffMemberDto>
{
    public async Task<StaffMemberDto> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await context.Staff
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Staff", request.Id);

        var emailTaken = await context.Staff
            .AnyAsync(s => s.Email == request.Email && s.Id != request.Id, cancellationToken);
        if (emailTaken)
            throw new ConflictException($"Email '{request.Email}' is already in use.");

        var department = await context.Departments
            .FirstOrDefaultAsync(d => d.Id == request.DepartmentId, cancellationToken)
            ?? throw new NotFoundException("Department", request.DepartmentId);

        staff.FullName = request.FullName;
        staff.Email = request.Email;
        staff.Role = Enum.Parse<StaffRole>(request.Role);
        staff.DepartmentId = request.DepartmentId;
        staff.Phone = request.Phone;
        staff.EmploymentType = Enum.Parse<EmploymentType>(request.EmploymentType);
        staff.Initials = string.Concat(
            request.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Take(2)
                .Select(w => char.ToUpper(w[0])));

        await context.SaveChangesAsync(cancellationToken);

        return new StaffMemberDto(
            staff.Id, staff.FullName, staff.Email, staff.Initials,
            staff.Role.ToString(), staff.DepartmentId, department.Name,
            staff.IsActive, staff.Phone, staff.EmploymentType.ToString(), staff.CreatedAt);
    }
}