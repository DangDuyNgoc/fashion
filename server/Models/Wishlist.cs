using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class Wishlist
    {
        public int Id { get; set; }

        [ForeignKey("UserId")]
        public Guid UserId { get; set; }

        public int ProductId { get; set; }

        public User User { get; set; } = null!;

        public Product Product { get; set; } = null!;
    }
}