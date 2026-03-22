using server.DTOs;

namespace server.Services
{
    public interface IProductImageService
    {
        Task<List<ProductImageDTO>> GetByProductId(int productId);
        Task<List<ProductImageDTO>> Create(ProductImageDTO dto);
        Task<bool> Delete(int id);
    }
}