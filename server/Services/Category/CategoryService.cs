using server.DTOs;
using server.Models;
using server.Repositories;

namespace server.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;

        public CategoryService(ICategoryRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<CategoryDTO>> GetAllAsync()
        {
            var categories = await _repo.GetAllAsync();

            return categories.Select(c => new CategoryDTO
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            }).ToList();
        }

        public async Task<CategoryDTO?> GetByIdAsync(int id)
        {
            var c = await _repo.GetByIdAsync(id);
            if (c == null) return null;

            return Map(c);
        }

        public async Task<CategoryDTO> CreateAsync(CategoryCreateDTO dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description
            };

            var created = await _repo.CreateAsync(category);

            return Map(created);
        }

        public async Task<CategoryDTO?> UpdateAsync(int id, CategoryUpdateDTO dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Name))
                existing.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                existing.Description = dto.Description;

            var updated = await _repo.UpdateAsync(existing);
            if (updated == null) return null;

            return Map(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repo.DeleteAsync(id);
        }

        private CategoryDTO Map(Category c)
        {
            return new CategoryDTO
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            };
        }
    }
}