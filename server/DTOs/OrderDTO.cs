namespace server.DTOs
{
    public class OrderResponse
    {
        public int Id { get; set; }

        public decimal TotalPrice { get; set; }

        public string Address { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public List<OrderItemResponse> Items { get; set; } = new();
    }

    public class OrderItemResponse
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public int VariantId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public bool IsReviewed { get; set; }
    }

     public class CreateOrderRequest
    {
        public int? AddressId { get; set; }

        public string PaymentMethod { get; set; } = "COD";
    }

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}