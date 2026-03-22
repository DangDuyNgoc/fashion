namespace server.DTOs
{
    // ================= RESPONSE =================
    public class CartDTO
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public List<CartItemDTO> Items { get; set; } = new();
    }

    public class CartItemDTO
    {
        public int Id { get; set; }
        public int VariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string VariantName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
    
    public class AddToCartDTO
    {
        public int VariantId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDTO
    {
        public int VariantId { get; set; }
        public int Quantity { get; set; }
    }
}