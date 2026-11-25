using ClinicalScheduler.Domain.Entities;

namespace ClinicalScheduler.Application.Common.Interfaces;

public interface IStaffRepository
{
    Task<Staff?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
