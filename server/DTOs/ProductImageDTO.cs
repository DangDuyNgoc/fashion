namespace server.DTOs
{
    public class ProductImageDTO
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class UploadProductImageDTO
    {
        public int ProductId { get; set; }
        public List<IFormFile> Images { get; set; } = new();
    }
}