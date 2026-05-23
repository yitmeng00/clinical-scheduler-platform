using ClinicalScheduler.Application.Overtime.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.Overtime.Queries.GetOvertimeReport;

public record GetOvertimeReportQuery(DateTime From, DateTime To) : IRequest<List<OvertimeRecordDto>>;