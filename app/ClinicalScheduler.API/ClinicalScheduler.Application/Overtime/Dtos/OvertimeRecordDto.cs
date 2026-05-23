namespace ClinicalScheduler.Application.Overtime.Dtos;

public record OvertimeRecordDto(
    int StaffId,
    string FullName,
    string Initials,
    string Department,
    string Role,
    string EmploymentType,
    int ShiftCount,
    double TotalHours,
    double RegularHours,
    double OvertimeHours,
    bool IsOvertime);