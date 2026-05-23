namespace ClinicalScheduler.Application.AuditLog.Dtos;

public record AuditEntryDto(
    DateTime At,
    string Category,
    string By,
    string Action,
    string? Note,
    string Subject);