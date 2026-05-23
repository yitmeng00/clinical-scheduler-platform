using MediatR;

namespace ClinicalScheduler.Application.Shifts.Commands.DeleteShift;

public record DeletedShiftInfo(int Id, int StaffId, string DepartmentName);

public record DeleteShiftCommand(int Id) : IRequest<DeletedShiftInfo>;
