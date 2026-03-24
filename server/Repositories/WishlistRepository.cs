using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Repositories
{
    public class WishlistRepository : IWishlistRepository
    {
        private readonly AppDbContext _context;

        public WishlistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Wishlist>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Wishlists
                .Include(w => w.Product)
                    .ThenInclude(p => p.Images)
                .Include(w => w.Product)
                    .ThenInclude(p => p.Variants)
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

        public async Task<Wishlist?> GetItemAsync(Guid userId, int productId)
        {
            return await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);
        }

        public async Task AddAsync(Wishlist wishlist)
        {
            await _context.Wishlists.AddAsync(wishlist);
        }

        public Task RemoveAsync(Wishlist wishlist)
        {
            _context.Wishlists.Remove(wishlist);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}