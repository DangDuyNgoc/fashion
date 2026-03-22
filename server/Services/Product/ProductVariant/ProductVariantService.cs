using server.DTOs;
using server.Models;
using server.Repositories;

namespace server.Services
{
    public class ProductVariantService : IProductVariantService
    {
        private readonly IProductVariantRepository _repo;

        public ProductVariantService(IProductVariantRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<ProductVariantDTO>> GetByProductId(int productId)
        {
            var variants = await _repo.GetByProductId(productId);

            return variants.Select(v => new ProductVariantDTO
            {
                Id = v.Id,
                ProductId = v.ProductId,
                Color = v.Color,
                Size = v.Size,
                Stock = v.Stock
            }).ToList();
        }

        public async Task<ProductVariantDTO> Create(CreateVariantDTO dto)
        {
            var variant = new ProductVariant
            {
                ProductId = dto.ProductId,
                Color = dto.Color,
                Size = dto.Size,
                Stock = dto.Stock
            };

            var created = await _repo.Create(variant);

            return new ProductVariantDTO
            {
                Id = created.Id,
                ProductId = created.ProductId,
                Color = created.Color,
                Size = created.Size,
                Stock = created.Stock
            };
        }

        public async Task<ProductVariantDTO?> Update(int id, UpdateVariantDTO dto)
        {
            var variant = new ProductVariant
            {
                Id = id,
                Color = dto.Color,
                Size = dto.Size,
                Stock = dto.Stock
            };

            var updated = await _repo.Update(variant);
            if (updated == null) return null;

            return new ProductVariantDTO
            {
                Id = updated.Id,
                ProductId = updated.ProductId,
                Color = updated.Color,
                Size = updated.Size,
                Stock = updated.Stock
            };
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Delete(id);
        }
    }
}