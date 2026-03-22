using server.DTOs;

namespace server.Services
{
    public interface ICategoryService
    {
        Task<List<CategoryDTO>> GetAllAsync();

        Task<CategoryDTO?> GetByIdAsync(int id);

        Task<CategoryDTO> CreateAsync(CategoryCreateDTO dto);

        Task<CategoryDTO?> UpdateAsync(int id, CategoryUpdateDTO dto);

        Task<bool> DeleteAsync(int id);
    }
}