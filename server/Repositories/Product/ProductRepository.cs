using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product?> UpdateAsync(Product product)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(p => p.Id == product.Id);
            if (existing == null) return null;

            existing.Name = product.Name;
            existing.Description = product.Description;
            existing.Price = product.Price;
            existing.CategoryId = product.CategoryId;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Product>> GetFilteredAsync(ProductFilterRequest filter)
        {
            var query = _context.Products
                .AsNoTracking()
                .Include(p => p.Images)
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .AsQueryable();

            // Category
            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
            }

            // Price
            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);
            }

            // Variant (Color + Size)
            if (!string.IsNullOrEmpty(filter.Color) || !string.IsNullOrEmpty(filter.Size))
            {
                query = query.Where(p =>
                    p.Variants.Any(v =>
                        (string.IsNullOrEmpty(filter.Color) || v.Color.ToLower() == filter.Color.ToLower()) &&
                        (string.IsNullOrEmpty(filter.Size) || v.Size.ToLower() == filter.Size.ToLower())
                    ));
            }

            // Keyword search
            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                 var keyword = $"%{filter.Keyword}%";

                query = query.Where(p =>
                    EF.Functions.Like(p.Name, keyword) ||
                    EF.Functions.Like(p.Description, keyword)
                );
            }

            // Pagination
            var page = filter.Page <= 0 ? 1 : filter.Page;
            var pageSize = filter.PageSize <= 0 ? 10 : filter.PageSize;

            query = query.Skip((page - 1) * pageSize)
                        .Take(pageSize);

            return await query.ToListAsync();
        }
    }
}