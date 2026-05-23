using ClinicalScheduler.Application.AuditLog.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.AuditLog.Queries.GetAuditLog;

public record GetAuditLogQuery(DateTime From, DateTime To, string? Category) : IRequest<List<AuditEntryDto>>;