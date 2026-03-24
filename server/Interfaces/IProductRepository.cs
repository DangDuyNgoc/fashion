using server.Models;

namespace server.Repositories
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();

        Task<Product?> GetByIdAsync(int id);

        Task<Product> CreateAsync(Product product);

        Task<Product?> UpdateAsync(Product product);
        
        Task<List<Product>> GetFilteredAsync(ProductFilterRequest filter);

        Task<bool> DeleteAsync(int id);

    }
}