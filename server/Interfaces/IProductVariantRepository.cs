using server.Models;

namespace server.Repositories
{
    public interface IProductVariantRepository
    {
        Task<List<ProductVariant>> GetByProductId(int productId);
        Task<ProductVariant?> GetById(int id);
        Task<ProductVariant> Create(ProductVariant variant);
        Task<ProductVariant?> Update(ProductVariant variant);
        Task<bool> Delete(int id);
    }
}