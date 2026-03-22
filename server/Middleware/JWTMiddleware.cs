using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace server.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _config;

        public JwtMiddleware(RequestDelegate next, IConfiguration config)
        {
            _next = next;
            _config = config;
        }

        public async Task Invoke(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            if(!string.IsNullOrEmpty(authHeader))
            {
                string token;
                if(authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    token = authHeader.Substring("Bearer ".Length).Trim();
                }
                else
                {
                    token = authHeader.Trim();
                }
                var isValid = AttachUserToContext(context, token);

                if (!isValid)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Invalid Token");
                    return;
                }
            }
            await _next(context);
        }

        private bool AttachUserToContext(HttpContext context, string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _config["Jwt:Issuer"],

                    ValidateAudience = true,
                    ValidAudience = _config["Jwt:Audience"],

                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                var userIdClaim = jwtToken.Claims
                    .FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);

                var email = jwtToken.Claims
                    .FirstOrDefault(x => x.Type == ClaimTypes.Email);

                var role = jwtToken.Claims
                    .FirstOrDefault(x => x.Type == ClaimTypes.Role);

                if (userIdClaim == null || email == null)
                    return false;

                if (!Guid.TryParse(userIdClaim.Value, out var userId))
                    return false;

                // attached context
                context.Items["UserId"] = userId;
                context.Items["Email"] = email?.Value;
                context.Items["Role"] = role?.Value ?? "User"; 

                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine("JWT Error: " + e.Message);
                context.Response.StatusCode = 401;
                return false;
            }
        }
    }
}