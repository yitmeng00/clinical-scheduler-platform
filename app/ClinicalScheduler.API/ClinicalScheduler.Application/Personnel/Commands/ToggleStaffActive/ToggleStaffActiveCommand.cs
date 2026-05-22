using ClinicalScheduler.Application.Personnel.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.Personnel.Commands.ToggleStaffActive;

public record ToggleStaffActiveCommand(int Id) : IRequest<StaffMemberDto>;