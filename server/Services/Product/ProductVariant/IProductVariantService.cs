using server.DTOs;

namespace server.Services
{
    public interface IProductVariantService
    {
        Task<List<ProductVariantDTO>> GetByProductId(int productId);
        Task<ProductVariantDTO> Create(CreateVariantDTO dto);
        Task<ProductVariantDTO?> Update(int id, UpdateVariantDTO dto);
        Task<bool> Delete(int id);
    }
}