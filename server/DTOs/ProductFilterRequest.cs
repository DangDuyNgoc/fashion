using server.Models;

namespace server.DTOs
{
    public class ProductFilterRequest
    {
        public int? CategoryId { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public string? Color { get; set; }

        public string? Size { get; set; }
        
        public string? Keyword { get; set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}