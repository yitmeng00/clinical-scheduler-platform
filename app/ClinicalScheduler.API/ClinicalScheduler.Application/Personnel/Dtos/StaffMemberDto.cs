namespace ClinicalScheduler.Application.Personnel.Dtos;

public record StaffMemberDto(
    int Id,
    string FullName,
    string Email,
    string Initials,
    string Role,
    int DepartmentId,
    string DepartmentName,
    bool IsActive,
    string? Phone,
    string EmploymentType,
    DateTime CreatedAt);