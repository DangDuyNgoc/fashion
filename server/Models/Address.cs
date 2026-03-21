using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class Address
    {
        public int Id { get; set; }

        [ForeignKey("UserId")]
        public Guid UserId { get; set; }

        public User User { get; set; } = null!;

        public string AddressLine { get; set; } = null!;

        public string City { get; set; } = null!;

        public string District { get; set; } = null!;

        public bool IsDefault { get; set; } = false;
    }
}