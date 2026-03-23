using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class WishlistItemDTO
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }

        public List<ProductVariantDTO> Variants { get; set; } = new();
    }

    public class AddWishlistDTO
    {
        [Required]
        public int ProductId { get; set; }
    }
}