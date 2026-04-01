using server.Models;

namespace server.Repositories
{
    public interface IProductImageRepository
    {
        Task<List<ProductImage>> GetByProductId(int productId);
        Task<ProductImage> Create(ProductImage image);
        Task<ProductImage?> GetById(int id);
        Task<bool> Update(ProductImage image);
        Task<bool> Delete(int id);
    }
}