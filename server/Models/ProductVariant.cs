namespace server.Models
{
    public class ProductVariant
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public Product Product { get; set; } = null!;

        public string Color { get; set; } = string.Empty;

        public string Size { get; set; } = string.Empty;

        public int Stock { get; set; }
    }
}