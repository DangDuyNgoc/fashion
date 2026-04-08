using server.DTOs;

namespace server.Services
{
    public interface IProductService
    {
        Task<List<ProductDTO>> GetAllAsync();
        Task<ProductDTO?> GetByIdAsync(int id);
        Task<ProductDTO> CreateAsync(CreateProductDTO dto);
        Task<ProductDTO?> UpdateAsync(int id, UpdateProductDTO dto);
        Task<List<ProductDTO>> GetFilteredAsync(ProductFilterRequest filter);
        Task<List<ProductDTO>> GetSuggestionsAsync(string query);
        Task<bool> DeleteAsync(int id);
    }
}