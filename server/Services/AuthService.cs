using System.IdentityModel.Tokens.Jwt;

using server.Models;
using server.Interfaces;
using server.DTOs;
using server.Services;
using System.Security.Claims;

public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly SecurityService _security;
    private readonly TokenService _token;
    private readonly EmailService _email;

    public AuthService(
        IUserRepository repo,
        SecurityService security,
        TokenService token,
        EmailService email)
    {
        _repo = repo;
        _security = security;
        _token = token;
        _email = email;
    }

    private const string DEFAULT_AVATAR = "https://res.cloudinary.com/dsfdghxx4/image/upload/v1730813754/nrxsg8sd9iy10bbsoenn_bzlq2c.png";

    public async Task<string> Register(RegisterRequest req)
    {
        if (_repo.GetByEmail(req.Email) != null)
            throw new Exception("Email exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Email = req.Email,
            PasswordHash = _security.HashPassword(req.Password),
            IsEmailVerified = false,
            AvatarUrl = DEFAULT_AVATAR
        };

        _repo.Add(user);
        _repo.Save();

        var (otp, sessionToken) = _token.GenerateOtpToken(user.Id, req.Email, "verify_email");
        var body = $"Your verification code is:\n\n{otp}\n\n" +
                   "Paste this code into the app to verify your email. It expires in 5 minutes.";

        await _email.SendAsync(user.Email, "Verify your email", body);

        return sessionToken;
    }

    public AuthResponse Login(LoginRequest req)
    {
        var user = _repo.GetByEmail(req.Email)
            ?? throw new Exception("Invalid email");

        if (!_security.VerifyPassword(req.Password, user.PasswordHash))
            throw new Exception("Wrong password");

        if (!user.IsEmailVerified)
            throw new Exception("Email not verified");

        var accessToken = _token.GenerateAccessToken(
            user.Id,
            user.Email,
            user.Role.ToString()
        );
        var refreshToken = _token.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        _repo.Update(user);
        _repo.Save();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };
    }

   public AuthResponse Refresh(string refreshToken)
    {
        var user = _repo.GetByRefreshToken(refreshToken)
            ?? throw new Exception("Invalid refresh token");

        if (user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new Exception("Token expired");

        var newAccessToken = _token.GenerateAccessToken(
            user.Id,
            user.Email,
            user.Role.ToString()
        );

        var newRefreshToken = _token.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        _repo.Update(user);
        _repo.Save();

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }

    public void Logout(string refreshToken)
    {
        var user = _repo.GetByRefreshToken(refreshToken);
        if (user == null) return;

        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;

        _repo.Update(user);
        _repo.Save();
    }

    public async Task<string> ForgotPassword(ForgotPasswordRequest req)
    {
        var user = _repo.GetByEmail(req.Email);
        if (user == null)
            throw new Exception("User not found");

        if (!user.IsEmailVerified)
            throw new Exception("Email not verified");

        var (otp, sessionToken) = 
            _token.GenerateResetPasswordOtp(user.Id, user.Email);

        var body = $"Your password reset code is:\n\n{otp}\n\n" +
                "Use this code to reset your password. It expires in 5 minutes.";

        await _email.SendAsync(user.Email, "Reset Password", body);
        return sessionToken;
    }

    public void ResetPassword(ResetPasswordRequest req)
    {
        var (userId, email, otp) = _token.ValidateOtpToken(req.SessionToken, "reset_password");

        var user = _repo.GetByEmail(email)
            ?? throw new Exception("Invalid token");

        if (user.Id != userId)
            throw new Exception("Invalid token");

        if (otp != req.OtpCode)
            throw new Exception("Invalid OTP");

        if (_security.VerifyPassword(req.NewPassword, user.PasswordHash))
            throw new Exception("New password must be different from old password");

        user.PasswordHash = _security.HashPassword(req.NewPassword);

        _repo.Update(user);
        _repo.Save();
    }

   public void VerifyEmail(VerifyEmailRequest req)
    {
        var (userId, email, otp) =
            _token.ValidateOtpToken(req.SessionToken, "verify_email");

        if (email != req.Email)
            throw new Exception("Invalid token");

        if (otp != req.OtpCode)
            throw new Exception("Invalid OTP");

        var user = _repo.GetByEmail(email)
            ?? throw new Exception("User not found");

        if (user.Id != userId)
            throw new Exception("Invalid user");

        user.IsEmailVerified = true;

        _repo.Update(user);
        _repo.Save();
    }

    public UserProfileResponse GetProfile(Guid userId)
    {
        var user = _repo.GetById(userId)
            ?? throw new Exception("User not found");

        return new UserProfileResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        };
    }

    public void UpdateProfile(Guid userId, UpdateProfileRequest req)
    {
        var user = _repo.GetById(userId)
            ?? throw new Exception("User not found");

        // validate
        if (string.IsNullOrWhiteSpace(req.Name))
            throw new Exception("Name is required");

        if (!string.IsNullOrEmpty(req.OldPassword) && 
            !string.IsNullOrEmpty(req.NewPassword))
        {
            if (!_security.VerifyPassword(req.OldPassword, user.PasswordHash))
                    throw new Exception("Old password incorrect");

            if (_security.VerifyPassword(req.NewPassword, user.PasswordHash))
                throw new Exception("New password must be different");

            user.PasswordHash = _security.HashPassword(req.NewPassword);
        }

        // update
        user.Name = req.Name.Trim();
        user.Phone = req.Phone?.Trim() ?? "";

        _repo.Update(user);
        _repo.Save();
    }

    public async Task<string> UploadAvatar(Guid userId, IFormFile file)
    {
        var user = _repo.GetById(userId)
            ?? throw new Exception("User not found");

        if (!file.ContentType.StartsWith("image/"))
            throw new Exception("Only image allowed");

        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");

        if (!Directory.Exists(folderPath))
            Directory.CreateDirectory(folderPath);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(folderPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        if (!string.IsNullOrEmpty(user.AvatarUrl) && !user.AvatarUrl.StartsWith("http"))
        {
            var oldPath = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot", user.AvatarUrl.TrimStart('/'));
            if (File.Exists(oldPath))
                File.Delete(oldPath);
        }

        var avatarUrl = $"/avatars/{fileName}";
        user.AvatarUrl = avatarUrl;

        _repo.Update(user);
        _repo.Save();

        return avatarUrl;
    }

    public void UpdateUserRole(Guid userId, string role)
    {
        var user = _repo.GetById(userId)
            ?? throw new Exception("User not found");

        if (string.IsNullOrWhiteSpace(role))
            throw new Exception("Role is required");

        // Optionally, validate only allowed roles
        if (!Enum.TryParse<UserRole>(role.Trim(), true, out var parsedRole))
            throw new Exception("Invalid role");

        user.Role = parsedRole;

        _repo.Update(user);
        _repo.Save();
    }

    public void DeleteUser(Guid userId)
    {
        var user = _repo.GetById(userId)
            ?? throw new Exception("User not found");

        _repo.Remove(user);
        _repo.Save();
    }
}