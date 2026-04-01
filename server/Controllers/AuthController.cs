using Microsoft.AspNetCore.Mvc;
using server.Services;
using server.DTOs;
using server.Middleware;
using System.Security.Claims;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var sessionToken = await _service.Register(req);
        return Ok(new { 
            message = "Sent verification email. Paste the code in the app to verify.", 
            sessionToken = sessionToken 
        }); 
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        try
        {
            var result = _service.Login(req);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public IActionResult Refresh([FromBody] RefreshRequest req)
    {
        try
        {
            var result = _service.Refresh(req.RefreshToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout([FromBody] RefreshRequest req)
    {
        _service.Logout(req.RefreshToken);
        return Ok(new { message = "Logged out" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> Forgot([FromBody] ForgotPasswordRequest req)
    {
        var sessionToken = await _service.ForgotPassword(req);

        return Ok(new { 
            message = "reset password email sent.",
            sessionToken = sessionToken,
        });
    }

    [HttpPost("reset-password")]
    public IActionResult Reset([FromBody] ResetPasswordRequest req)
    {
        try
        {
            _service.ResetPassword(req);
            return Ok(new { message = "Password reset success" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("verify-email")]
    public IActionResult VerifyEmail([FromBody] VerifyEmailRequest req)
    {
        try
        {
            _service.VerifyEmail(req);
            return Ok(new { message = "Email verified" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("users")]
    [Authorize(Role = "Admin")]
    public IActionResult GetAllUsers()
    {
        try
        {
            var result = _service.GetAllUsers();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Unauthorized" });
        }

        var result = _service.GetProfile(userId);
        return Ok(new { message = "Profile retrieved successfully", data = result });
    }

    [HttpPut("profile")]
    [Authorize]
    public IActionResult UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = (Guid?)HttpContext.Items["UserId"];

        if (userId == null)
            return Unauthorized(new { message = "Unauthorized" });

        _service.UpdateProfile(userId.Value, req);

        return Ok(new { message = "Profile updated successfully" });
    }

    [HttpPost("upload-avatar")]
    public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarRequest req)
    {
        try
        {
            var userId = (Guid?)HttpContext.Items["UserId"];

            if (userId == null)
                return Unauthorized(new { message = "Unauthorized" });

            var url = await _service.UploadAvatar(userId.Value, req.File);

            return Ok(new { avatarUrl = url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{userId}/role")]
    [Authorize(Role = "Admin")]
    public IActionResult UpdateRole(Guid userId, [FromBody] UpdateUserRoleRequest req)
    {
        try
        {
            _service.UpdateUserRole(userId, req.Role);
            return Ok(new { message = "User role updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{userId}")]
    [Authorize(Role = "Admin")]
    public IActionResult DeleteUser(Guid userId)
    {
        try
        {
            _service.DeleteUser(userId);
            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}