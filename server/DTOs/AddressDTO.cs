using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class AddressDTO
    {
        public int Id { get; set; }
        public string AddressLine { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }

    public class CreateAddressDTO
    {
        [Required]
        public string AddressLine { get; set; } = string.Empty;
        [Required]
        public string City { get; set; } = string.Empty;
        [Required]
        public string District { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
    }

    public class UpdateAddressDTO
    {
        [Required]
        public string AddressLine { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}