using ClinicalScheduler.Application.Common.Interfaces;
using ClinicalScheduler.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicalScheduler.Infrastructure.Persistence.Repositories;

public class StaffRepository(AppDbContext context) : IStaffRepository
{
    public async Task<Staff?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => await context.Staff
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Email == email.ToLowerInvariant(), cancellationToken);
}
