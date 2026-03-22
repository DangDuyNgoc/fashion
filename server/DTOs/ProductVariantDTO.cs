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
        public int ProductId { get; set; }
        public string Color { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Stock { get; set; }
    }

    public class UpdateVariantDTO
    {
        public string Color { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Stock { get; set; }
    }
}