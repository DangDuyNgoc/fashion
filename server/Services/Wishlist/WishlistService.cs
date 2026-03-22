using server.DTOs;
using server.Models;
using server.Repositories;

namespace server.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _repo;

        public WishlistService(IWishlistRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<WishlistItemDTO>> GetWishlistAsync(Guid userId)
        {
            var items = await _repo.GetByUserIdAsync(userId);

            return items.Select(w => new WishlistItemDTO
            {
                Id = w.Id,
                ProductId = w.ProductId,
                ProductName = w.Product.Name,
                Price = w.Product.Price,
                ImageUrl = w.Product.Images.FirstOrDefault()?.ImageUrl, 

                Variants = w.Product.Variants.Select(v => new ProductVariantDTO
                {
                    Id = v.Id,
                    Size = v.Size,
                    Color = v.Color,
                    Stock = v.Stock
                }).ToList()
            }).ToList();
        }

        public async Task AddToWishlistAsync(Guid userId, int productId)
        {
            var existing = await _repo.GetItemAsync(userId, productId);

            if (existing != null)
                return; 

            var wishlist = new Wishlist
            {
                UserId = userId,
                ProductId = productId
            };

            await _repo.AddAsync(wishlist);
            await _repo.SaveChangesAsync();
        }

        public async Task RemoveFromWishlistAsync(Guid userId, int productId)
        {
            var item = await _repo.GetItemAsync(userId, productId);

            if (item == null)
                return;

            await _repo.RemoveAsync(item);
            await _repo.SaveChangesAsync();
        }
    }
}