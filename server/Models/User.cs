using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = null!;

        public string Phone { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; } = null;

        public UserRole Role { get; set; } = UserRole.User;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsEmailVerified { get; set; } = false;

        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiry { get; set; }

        public List<Order> Orders { get; set; } = new();

        public List<Review> Reviews { get; set; } = new();

        public List<Address> Addresses { get; set; } = new();
    }

    public enum UserRole
    {
        User,
        Admin
    }
}