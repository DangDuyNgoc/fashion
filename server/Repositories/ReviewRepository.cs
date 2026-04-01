using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Interfaces;
using server.Models;

namespace server.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
        }

        public async Task<bool> ExistsByOrderItemAsync(int orderItemId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.OrderItemId == orderItemId);
        }

        public async Task<List<Review>> GetByProductIdAsync(int productId)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Review>> GetAllAsync()
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .Include(r => r.OrderItem)
                    .ThenInclude(oi => oi.Order)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public Task DeleteAsync(Review review)
        {
            _context.Reviews.Remove(review);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}