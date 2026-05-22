using ClinicalScheduler.Application.Personnel.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.Personnel.Commands.CreateStaff;

public record CreateStaffCommand(
    string FullName,
    string Email,
    string Password,
    string Role,
    int DepartmentId,
    string? Phone,
    string EmploymentType) : IRequest<StaffMemberDto>;