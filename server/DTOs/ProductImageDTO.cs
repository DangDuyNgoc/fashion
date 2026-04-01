using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class ProductImageDTO
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? Color { get; set; }
    }

    public class UploadProductImageDTO
    {
        [Required]
        public int ProductId { get; set; }
        public List<IFormFile> Images { get; set; } = new();
        public string? Color { get; set; }
    }

    public class UpdateProductImageColorRequest
    {
        public string Color { get; set; } = string.Empty;
    }
}