using ClinicalScheduler.Application.Personnel.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.Personnel.Commands.UpdateStaff;

public record UpdateStaffCommand(
    int Id,
    string FullName,
    string Email,
    string Role,
    int DepartmentId,
    string? Phone,
    string EmploymentType) : IRequest<StaffMemberDto>;