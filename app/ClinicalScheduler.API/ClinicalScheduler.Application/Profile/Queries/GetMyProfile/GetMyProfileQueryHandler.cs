using ClinicalScheduler.Application.Common.Exceptions;
using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Application.Profile.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Profile.Queries.GetMyProfile;

public class GetMyProfileQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMyProfileQuery, MyProfileDto>
{
    public async Task<MyProfileDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        var staff = await context.Staff
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == request.StaffId, cancellationToken)
            ?? throw new NotFoundException("Staff", request.StaffId);

        return new MyProfileDto(
            staff.Id,
            staff.FullName,
            staff.Email,
            staff.Initials,
            staff.Role.ToString(),
            staff.Department.Name,
            staff.Phone,
            staff.EmploymentType.ToString());
    }
}