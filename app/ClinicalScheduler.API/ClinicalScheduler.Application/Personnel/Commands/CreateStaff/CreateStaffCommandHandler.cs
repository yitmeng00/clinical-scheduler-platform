using ClinicalScheduler.Application.Common.Exceptions;
using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Application.Personnel.Dtos;
using ClinicalScheduler.Domain.Entities;
using ClinicalScheduler.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Personnel.Commands.CreateStaff;

public class CreateStaffCommandHandler(IApplicationDbContext context, IPasswordHasher hasher)
    : IRequestHandler<CreateStaffCommand, StaffMemberDto>
{
    public async Task<StaffMemberDto> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        var emailTaken = await context.Staff
            .AnyAsync(s => s.Email == request.Email, cancellationToken);
        if (emailTaken)
            throw new ConflictException($"Email '{request.Email}' is already in use.");

        var department = await context.Departments
            .FirstOrDefaultAsync(d => d.Id == request.DepartmentId, cancellationToken)
            ?? throw new NotFoundException("Department", request.DepartmentId);

        var role = Enum.Parse<StaffRole>(request.Role);
        var employmentType = Enum.Parse<EmploymentType>(request.EmploymentType);

        var initials = string.Concat(
            request.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Take(2)
                .Select(w => char.ToUpper(w[0])));

        var staff = new Staff
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = hasher.Hash(request.Password),
            Role = role,
            DepartmentId = request.DepartmentId,
            Phone = request.Phone,
            EmploymentType = employmentType,
            Initials = initials,
            IsActive = true,
        };

        context.Staff.Add(staff);
        await context.SaveChangesAsync(cancellationToken);

        return new StaffMemberDto(
            staff.Id, staff.FullName, staff.Email, staff.Initials,
            staff.Role.ToString(), staff.DepartmentId, department.Name,
            staff.IsActive, staff.Phone, staff.EmploymentType.ToString(), staff.CreatedAt);
    }
}