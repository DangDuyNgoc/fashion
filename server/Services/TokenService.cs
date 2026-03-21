using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    //ACCESS TOKEN (LOGIN)
    public string GenerateAccessToken(Guid userId, string email, string role)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // REFRESH TOKEN
    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    //OTP TOKEN (CORE)
    public (string otp, string token) GenerateOtpToken(
        Guid userId,
        string email,
        string purpose,
        int minutes = 5)
    {
        string otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim("purpose", purpose),
            new Claim("otp", otp)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return (otp, jwt);
    }

    //VERIFY EMAIL OTP
    public (string otp, string token) GenerateEmailVerificationOtp(Guid userId, string email)
    {
        return GenerateOtpToken(userId, email, "verify_email", 5);
    }

    // RESET PASSWORD OTP
    public (string otp, string token) GenerateResetPasswordOtp(Guid userId, string email)
    {
        return GenerateOtpToken(userId, email, "reset_password", 5);
    }

    // VALIDATE OTP TOKEN
    public (Guid userId, string email, string otp) ValidateOtpToken(string token, string expectedPurpose)
    {
        var handler = new JwtSecurityTokenHandler();

        var principal = handler.ValidateToken(
            token,
            GetValidationParameters(),
            out _
        );

        var purpose = principal.FindFirst("purpose")?.Value;
        if (purpose != expectedPurpose)
            throw new SecurityTokenException("Invalid token purpose");

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = principal.FindFirst(ClaimTypes.Email)?.Value;
        var otp = principal.FindFirst("otp")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(otp))
            throw new SecurityTokenException("Invalid token payload");

        if (!Guid.TryParse(userIdClaim, out var userId))
            throw new SecurityTokenException("Invalid user id");

        return (userId, email, otp);
    }

    // VALIDATION PARAMS
    private TokenValidationParameters GetValidationParameters()
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        return new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,

            ValidateIssuer = true,
            ValidIssuer = _config["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = _config["Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30) 
        };
    }
}