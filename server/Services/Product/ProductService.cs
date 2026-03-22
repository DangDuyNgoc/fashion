using server.DTOs;
using server.Models;
using server.Repositories;
using server.Data;

namespace server.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;
        private readonly AppDbContext _context;

        public ProductService(IProductRepository repo, AppDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<List<ProductDTO>> GetAllAsync()
        {
            var products = await _repo.GetAllAsync();

            return products.Select(MapToDTO).ToList();
        }

        public async Task<ProductDTO?> GetByIdAsync(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return null;

            return MapToDTO(product);
        }

        public async Task<ProductDTO> CreateAsync(CreateProductDTO dto)
        {
            // validate
            if (dto.Price <= 0)
                throw new Exception("Price must be > 0");

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = dto.CategoryId,

                Images = dto.ImageUrls.Select(url => new ProductImage
                {
                    ImageUrl = url
                }).ToList(),

                Variants = dto.Variants.Select(v => new ProductVariant
                {
                    Color = v.Color,
                    Size = v.Size,
                    Stock = v.Stock
                }).ToList()
            };

            var created = await _repo.CreateAsync(product);

            return MapToDTO(created);
        }

        public async Task<ProductDTO?> UpdateAsync(int id, UpdateProductDTO dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return null;

            existing.Name = dto.Name;
            existing.Description = dto.Description;
            existing.Price = dto.Price;
            existing.CategoryId = dto.CategoryId;

            await _context.SaveChangesAsync();

            return MapToDTO(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repo.DeleteAsync(id);
        }

        private ProductDTO MapToDTO(Product p)
        {
            return new ProductDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? "",

                CreatedAt = p.CreatedAt,

                Images = p.Images.Select(i => new ProductImageDTO
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl
                }).ToList(),

                Variants = p.Variants.Select(v => new ProductVariantDTO
                {
                    Id = v.Id,
                    Color = v.Color,
                    Size = v.Size,
                    Stock = v.Stock
                }).ToList()
            };
        }
    }
}