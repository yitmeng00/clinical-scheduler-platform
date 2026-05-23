using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Application.Overtime.Dtos;
using ClinicalScheduler.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.Overtime.Queries.GetOvertimeReport;

public class GetOvertimeReportQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetOvertimeReportQuery, List<OvertimeRecordDto>>
{
    private static double RegularHoursFor(EmploymentType type) => type switch
    {
        EmploymentType.PartTime => 24,
        _ => 40,
    };

    public async Task<List<OvertimeRecordDto>> Handle(
        GetOvertimeReportQuery request,
        CancellationToken cancellationToken)
    {
        var toExclusive = request.To.AddDays(1);

        var shifts = await context.Shifts
            .Include(s => s.Staff).ThenInclude(st => st.Department)
            .Where(s => s.StartTime >= request.From && s.StartTime < toExclusive && s.Staff.IsActive)
            .ToListAsync(cancellationToken);

        return shifts
            .GroupBy(s => s.Staff)
            .Select(g =>
            {
                var staff = g.Key;
                var totalHours = g.Sum(s => (s.EndTime - s.StartTime).TotalHours);
                var regularHours = RegularHoursFor(staff.EmploymentType);
                var overtimeHours = Math.Max(0, totalHours - regularHours);

                return new OvertimeRecordDto(
                    staff.Id,
                    staff.FullName,
                    staff.Initials,
                    staff.Department.Name,
                    staff.Role.ToString(),
                    staff.EmploymentType.ToString(),
                    g.Count(),
                    Math.Round(totalHours, 1),
                    regularHours,
                    Math.Round(overtimeHours, 1),
                    overtimeHours > 0);
            })
            .OrderByDescending(r => r.OvertimeHours)
            .ThenBy(r => r.FullName)
            .ToList();
    }
}