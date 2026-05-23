using ClinicalScheduler.Application.Profile.Dtos;
using MediatR;

namespace ClinicalScheduler.Application.Profile.Queries.GetMyProfile;

public record GetMyProfileQuery(int StaffId) : IRequest<MyProfileDto>;