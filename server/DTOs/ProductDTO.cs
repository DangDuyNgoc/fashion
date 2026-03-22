namespace server.DTOs
{
    public class ProductDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public List<ProductImageDTO> Images { get; set; } = new();

        public List<ProductVariantDTO> Variants { get; set; } = new();
    }

    public class CreateProductDTO
    {
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int CategoryId { get; set; }

        public List<string> ImageUrls { get; set; } = new();

        public List<CreateVariantDTO> Variants { get; set; } = new();
    }

    public class UpdateProductDTO
    {
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int CategoryId { get; set; }
    }
}