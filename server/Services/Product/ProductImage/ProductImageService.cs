using server.DTOs;
using server.Models;
using server.Repositories;
using server.Services;

namespace server.Services
{
    public class ProductImageService : IProductImageService
    {
        private readonly IProductImageRepository _repo;

        public ProductImageService(IProductImageRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<ProductImageDTO>> GetByProductId(int productId)
        {
            var images = await _repo.GetByProductId(productId);

            return images.Select(i => new ProductImageDTO
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ImageUrl = i.ImageUrl,
                Color = i.Color
            }).ToList();
        }

        public async Task<List<ProductImageDTO>> UploadImages(UploadProductImageDTO dto)
        {
            var result = new List<ProductImageDTO>();

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            foreach (var file in dto.Images)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var image = new ProductImage
                {
                    ProductId = dto.ProductId,
                    ImageUrl = "/images/" + fileName,
                    Color = dto.Color
                };

                var created = await _repo.Create(image);

                result.Add(new ProductImageDTO
                {
                    Id = created.Id,
                    ProductId = created.ProductId,
                    ImageUrl = created.ImageUrl,
                    Color = created.Color
                });
            }
            return result;

        }

        public async Task<bool> UpdateColor(int id, string color)
        {
            var image = await _repo.GetById(id);
            if (image == null) return false;

            image.Color = color;
            return await _repo.Update(image);
        }

        public async Task<bool> Delete(int id)
        {
            return await _repo.Delete(id);
        }
    }
}