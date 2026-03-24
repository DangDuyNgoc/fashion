using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class ProductVariantDTO
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Color { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Stock { get; set; }
    }

    public class CreateVariantDTO
    {

        [Required]
        public int ProductId { get; set; }

        [Required]
        public string Color { get; set; } = string.Empty;
        
        [Required]
        public string Size { get; set; } = string.Empty;

        [Required]
        public int Stock { get; set; }
    }

    public class UpdateVariantDTO
    {
        [Required]
        public string Color { get; set; } = string.Empty;

        [Required]
        public string Size { get; set; } = string.Empty;
        
        [Required]
        public int Stock { get; set; }
    }
}