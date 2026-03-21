using System.Runtime.CompilerServices;
using server.DTOs;

namespace server.Services
{
    public interface IAuthService
    {
        Task<string> Register(RegisterRequest req);
        AuthResponse Login(LoginRequest req);
        Task<string> UploadAvatar(Guid userId, IFormFile file);
        AuthResponse Refresh(string refreshToken);
        void Logout(string refreshToken);
        Task<string> ForgotPassword(ForgotPasswordRequest req);
        void ResetPassword(ResetPasswordRequest req);
        void VerifyEmail(VerifyEmailRequest req);
        UserProfileResponse GetProfile(Guid userId);
        void UpdateProfile(Guid userId, UpdateProfileRequest req);
        void UpdateUserRole(Guid userId, string role);
        void DeleteUser(Guid userId);
    }
}