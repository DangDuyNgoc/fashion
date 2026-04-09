using server.DTOs;
using server.Models;
using server.Repositories;

namespace server.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;

        public ProductService(IProductRepository repo)
        {
            _repo = repo;
        }

        // ================= GET ALL =================
        public async Task<List<ProductDTO>> GetAllAsync()
        {
            var products = await _repo.GetAllAsync();

            return products.Select(MapToDTO).ToList();
        }

        // ================= GET BY ID =================
        public async Task<ProductDTO?> GetByIdAsync(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return null;

            return MapToDTO(product);
        }

        // ================= CREATE =================
        public async Task<ProductDTO> CreateAsync(CreateProductDTO dto)
        {
            // ===== VALIDATE =====
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new Exception("Name is required");

            if (dto.Price <= 0)
                throw new Exception("Price must be > 0");

            // ===== MAP =====
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.UtcNow,
            };

            var created = await _repo.CreateAsync(product);

            var fullProduct = await _repo.GetByIdAsync(created.Id);
            if (fullProduct == null)
                throw new Exception("Created product not found");

            return MapToDTO(created);
        }

        // ================= UPDATE =================
        public async Task<ProductDTO?> UpdateAsync(int id, UpdateProductDTO dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return null;

            // ===== SAFE UPDATE =====
            if (!string.IsNullOrWhiteSpace(dto.Name))
                existing.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                existing.Description = dto.Description;

            if (dto.Price > 0)
                existing.Price = dto.Price;

            if (dto.CategoryId > 0)
                existing.CategoryId = dto.CategoryId;

            var updated = await _repo.UpdateAsync(existing);
            if (updated == null) return null;

            return MapToDTO(updated);
        }

        // ================= DELETE =================
        public async Task<bool> DeleteAsync(int id)
        {
            return await _repo.DeleteAsync(id);
        }

        // ================= GET FILTERED =================
        public async Task<List<ProductDTO>> GetFilteredAsync(ProductFilterRequest filter)
        {
            var products = await _repo.GetFilteredAsync(filter);
            return products.Select(MapToDTO).ToList();
        }


        // ================= MAPPING =================
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

                 Variants = p.Variants?.Select(v => new ProductVariantDTO
                {
                    Id = v.Id,
                    ProductId = v.ProductId,
                    Color = v.Color,
                    Size = v.Size,
                    Stock = v.Stock
                }).ToList() ?? new List<ProductVariantDTO>(),

                Images = p.Images?.Select(i => new ProductImageDTO
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ImageUrl = i.ImageUrl
                }).ToList() ?? new List<ProductImageDTO>(),
            };
        }
    }
}