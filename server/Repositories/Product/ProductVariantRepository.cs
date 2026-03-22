using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Repositories
{
    public class ProductVariantRepository : IProductVariantRepository
    {
        private readonly AppDbContext _context;

        public ProductVariantRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductVariant>> GetByProductId(int productId)
        {
            return await _context.ProductVariants
                .Where(v => v.ProductId == productId)
                .ToListAsync();
        }

        public async Task<ProductVariant?> GetById(int id)
        {
            return await _context.ProductVariants.FindAsync(id);
        }

        public async Task<ProductVariant> Create(ProductVariant variant)
        {
            _context.ProductVariants.Add(variant);
            await _context.SaveChangesAsync();
            return variant;
        }

        public async Task<ProductVariant?> Update(ProductVariant variant)
        {
            var existing = await _context.ProductVariants.FindAsync(variant.Id);
            if (existing == null) return null;

            existing.Color = variant.Color;
            existing.Size = variant.Size;
            existing.Stock = variant.Stock;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> Delete(int id)
        {
            var v = await _context.ProductVariants.FindAsync(id);
            if (v == null) return false;

            _context.ProductVariants.Remove(v);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}