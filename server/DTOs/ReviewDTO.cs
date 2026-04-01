namespace server.DTOs
{
    public class ReviewResponse
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public Guid UserId { get; set; }
 
        public string ProductName { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }

    public class CreateReviewRequest
    {

        public int OrderItemId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;
    }

    public class UpdateReviewRequest
    {
        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;
    }
}