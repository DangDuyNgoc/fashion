using server.DTOs;

namespace server.Services
{
    public interface IProductImageService
    {
        Task<List<ProductImageDTO>> GetByProductId(int productId);
        Task<List<ProductImageDTO>> UploadImages(UploadProductImageDTO dto);
        Task<bool> Delete(int id);
    }
}