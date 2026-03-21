using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{  
    public class RegisterRequest
    {
        
        [Required]
        public string Name { get; set; } = null!;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }

    public class AuthResponse
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }

    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
    }

    public class ResetPasswordRequest
    {
        [Required]
        public string Email { get; set; } = null!;
        [Required]
        public string OtpCode { get; set; } = null!;
        [Required]
        public string SessionToken { get; set; } = null!;
        [Required]
        public string NewPassword { get; set; } = null!;
    }

    public class RefreshRequest
    {
        [Required]
        public string RefreshToken { get; set; } = null!;
    }

    public class VerifyEmailRequest
    {
        [Required] public string Email { get; set; } = null!;
        [Required] public string OtpCode { get; set; } = null!;
        [Required] public string SessionToken { get; set; } = null!;
    }

    public class UploadAvatarRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }

    public class UserProfileResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Role { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? OldPassword { get; set; }
        public string? NewPassword { get; set; }
    }

    public class UpdateUserRoleRequest
    {
        [Required]
        public string Role { get; set; } = null!;
    }
}
