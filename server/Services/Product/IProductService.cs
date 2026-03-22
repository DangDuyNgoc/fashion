using server.DTOs;

namespace server.Services
{
    public interface IProductService
    {
        Task<List<ProductDTO>> GetAllAsync();
        Task<ProductDTO?> GetByIdAsync(int id);
        Task<ProductDTO> CreateAsync(CreateProductDTO dto);
        Task<ProductDTO?> UpdateAsync(int id, UpdateProductDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}