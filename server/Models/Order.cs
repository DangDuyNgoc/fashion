using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class Order
    {
        public int Id { get; set; }

        [ForeignKey("UserId")]
        public Guid UserId { get; set; }

        public User User { get; set; } = null!;

        public decimal TotalPrice { get; set; }

        public string Address { get; set; } = null!;

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public string PaymentMethod { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public List<OrderItem> Items { get; set; } = new();
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }
}