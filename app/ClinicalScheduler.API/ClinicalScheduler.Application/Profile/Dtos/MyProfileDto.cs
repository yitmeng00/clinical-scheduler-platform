namespace ClinicalScheduler.Application.Profile.Dtos;

public record MyProfileDto(
    int Id,
    string FullName,
    string Email,
    string Initials,
    string Role,
    string Department,
    string? Phone,
    string EmploymentType);