using ClinicalScheduler.Application.Personnel.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.Personnel.Queries.GetDepartments;

public record GetDepartmentsQuery : IRequest<List<DepartmentDto>>;