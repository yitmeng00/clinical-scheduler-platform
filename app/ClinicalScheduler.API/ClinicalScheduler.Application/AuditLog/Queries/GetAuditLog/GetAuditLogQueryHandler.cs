using ClinicalScheduler.Application.AuditLog.Dtos;
using ClinicalScheduler.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Application.AuditLog.Queries.GetAuditLog;

public class GetAuditLogQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAuditLogQuery, List<AuditEntryDto>>
{
    public async Task<List<AuditEntryDto>> Handle(
        GetAuditLogQuery request,
        CancellationToken cancellationToken)
    {
        var toExclusive = request.To.AddDays(1);
        var entries = new List<AuditEntryDto>();

        if (request.Category is null or "Leave")
        {
            var leaveEntries = await context.LeaveRequests
                .Include(l => l.AuditEntries)
                .Include(l => l.Staff)
                .SelectMany(l => l.AuditEntries
                    .Where(e => e.At >= request.From && e.At < toExclusive)
                    .Select(e => new AuditEntryDto(
                        e.At,
                        "Leave",
                        e.By,
                        e.Action,
                        e.Note,
                        l.Staff.FullName + " — " + l.LeaveType.ToString() + " Leave")))
                .ToListAsync(cancellationToken);

            entries.AddRange(leaveEntries);
        }

        if (request.Category is null or "Swap")
        {
            var swapEntries = await context.ShiftSwapRequests
                .Include(s => s.AuditEntries)
                .Include(s => s.Requester)
                .Include(s => s.Requestee)
                .SelectMany(s => s.AuditEntries
                    .Where(e => e.At >= request.From && e.At < toExclusive)
                    .Select(e => new AuditEntryDto(
                        e.At,
                        "Swap",
                        e.By,
                        e.Action,
                        e.Note,
                        s.Requester.FullName + " ↔ " + s.Requestee.FullName)))
                .ToListAsync(cancellationToken);

            entries.AddRange(swapEntries);
        }

        return entries.OrderByDescending(e => e.At).ToList();
    }
}