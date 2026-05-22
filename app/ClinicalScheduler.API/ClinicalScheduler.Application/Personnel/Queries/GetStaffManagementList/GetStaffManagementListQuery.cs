using ClinicalScheduler.Application.Personnel.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.Personnel.Queries.GetStaffManagementList;

public record GetStaffManagementListQuery : IRequest<List<StaffMemberDto>>;