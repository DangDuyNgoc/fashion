using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http;

namespace server.Middleware
{
    public class AuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        public string? Role { get; set; }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var userId = context.HttpContext.Items["UserId"];
            var role = context.HttpContext.Items["Role"]?.ToString();

            if (userId == null)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    message = "Unauthorized"
                });
                return;
            }

            if (!string.IsNullOrEmpty(Role) && role != Role)
            {
                context.Result = new ObjectResult(new
                {
                    message = "Forbidden"
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }
        }
    }
}