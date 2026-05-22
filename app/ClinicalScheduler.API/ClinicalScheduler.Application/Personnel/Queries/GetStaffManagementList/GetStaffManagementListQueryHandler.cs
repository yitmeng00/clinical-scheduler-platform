using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Application.Personnel.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Personnel.Queries.GetStaffManagementList;

public class GetStaffManagementListQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetStaffManagementListQuery, List<StaffMemberDto>>
{
    public async Task<List<StaffMemberDto>> Handle(
        GetStaffManagementListQuery request,
        CancellationToken cancellationToken)
        => await context.Staff
            .Include(s => s.Department)
            .OrderBy(s => s.FullName)
            .Select(s => new StaffMemberDto(
                s.Id,
                s.FullName,
                s.Email,
                s.Initials,
                s.Role.ToString(),
                s.DepartmentId,
                s.Department.Name,
                s.IsActive,
                s.Phone,
                s.EmploymentType.ToString(),
                s.CreatedAt))
            .ToListAsync(cancellationToken);
}