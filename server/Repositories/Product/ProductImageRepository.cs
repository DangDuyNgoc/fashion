using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Repositories
{
    public class ProductImageRepository : IProductImageRepository
    {
        private readonly AppDbContext _context;

        public ProductImageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductImage>> GetByProductId(int productId)
        {
            return await _context.ProductImages
                .Where(i => i.ProductId == productId)
                .ToListAsync();
        }

        public async Task<ProductImage> Create(ProductImage image)
        {
            _context.ProductImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<ProductImage?> GetById(int id)
        {
            return await _context.ProductImages.FindAsync(id);
        }

        public async Task<bool> Update(ProductImage image)
        {
            _context.ProductImages.Update(image);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> Delete(int id)
        {
            var img = await _context.ProductImages.FindAsync(id);
            if (img == null) return false;

            _context.ProductImages.Remove(img);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}