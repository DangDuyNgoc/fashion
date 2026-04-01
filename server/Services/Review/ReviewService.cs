using server.DTOs;
using server.Models;
using server.Repositories;
using server.Interfaces;
using Microsoft.EntityFrameworkCore;
using server.Middleware;
using server.Services;

namespace server.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepo;

        private readonly IOrderItemRepository _orderItemRepo;

        public ReviewService(IReviewRepository reviewRepo, IOrderItemRepository orderItemRepo)
        {
            _reviewRepo = reviewRepo;
            _orderItemRepo = orderItemRepo;
        }

        public async Task<ReviewResponse> CreateReviewAsync(Guid userId, CreateReviewRequest req)
        {
            var orderItem = await _orderItemRepo.GetByIdWithDetailsAsync(req.OrderItemId);

            if (orderItem == null)
                throw new Exception("Order item not found");

            if (orderItem.Order.UserId != userId)
                throw new Exception("Unauthorized");

            if (orderItem.Order.Status != OrderStatus.Delivered)
                throw new Exception("Order not delivered");

            if (req.Rating < 1 || req.Rating > 5)
                throw new Exception("Rating must be between 1-5");

            var exists = await _reviewRepo.ExistsByOrderItemAsync(req.OrderItemId);
            if (exists)
                throw new Exception("Already reviewed");

            var review = new Review
            {
                UserId = userId,
                ProductId = orderItem.Variant.ProductId,
                OrderItemId = orderItem.Id,
                Rating = req.Rating,
                Comment = req.Comment
            };

            await _reviewRepo.CreateAsync(review);
            await _reviewRepo.SaveChangesAsync();

            return new ReviewResponse
            {
                Id = review.Id,
                ProductId = review.ProductId,
                UserId = review.UserId,
                UserName = orderItem.Order.User.Name,
                ProductName = orderItem.Variant.Product.Name,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<List<ReviewResponse>> GetReviewsByProductIdAsync(int productId)
        {
            var reviews = await _reviewRepo.GetByProductIdAsync(productId);

            return reviews.Select(r => new ReviewResponse
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.User.Name,
                ProductName = r.Product?.Name ?? string.Empty,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        public async Task<ReviewResponse?> GetReviewByIdAsync(int reviewId)
        {
            var review = await _reviewRepo.GetByIdAsync(reviewId);

            if (review == null)
                return null;

            return new ReviewResponse
            {
                Id = review.Id,
                ProductId = review.ProductId,
                UserId = review.UserId,
                UserName = review.User.Name,
                ProductName = review.Product?.Name ?? string.Empty,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task UpdateReviewAsync(Guid userId, int reviewId, UpdateReviewRequest req)
        {
            var review = await _reviewRepo.GetByIdAsync(reviewId);

            if (review == null)
                throw new Exception("Review not found");

            // owner
            if (review.UserId != userId)
                throw new Exception("Unauthorized");

            if (review.OrderItem.Order.Status != OrderStatus.Delivered)
                throw new Exception("Cannot update review");

            // validate rating
            if (req.Rating < 1 || req.Rating > 5)
                throw new Exception("Rating must be between 1-5");

            review.Rating = req.Rating;
            review.Comment = req.Comment;

            await _reviewRepo.SaveChangesAsync();
        }

        public async Task DeleteReviewAsync(Guid userId, int reviewId)
        {
            var review = await _reviewRepo.GetByIdAsync(reviewId);

            if (review == null)
                throw new Exception("Review not found");

            if (review.UserId != userId)
                throw new Exception("Unauthorized");

            await _reviewRepo.DeleteAsync(review);
            await _reviewRepo.SaveChangesAsync();
        }

        public async Task DeleteReviewByAdminAsync(int reviewId)
        {
            var review = await _reviewRepo.GetByIdAsync(reviewId);

            if (review == null)
                throw new Exception("Review not found");

            await _reviewRepo.DeleteAsync(review);
            await _reviewRepo.SaveChangesAsync();
        }

        public async Task UpdateReviewByAdminAsync(int reviewId, UpdateReviewRequest req)
        {
            var review = await _reviewRepo.GetByIdAsync(reviewId);

            if (review == null)
                throw new Exception("Review not found");

            review.Rating = req.Rating;
            review.Comment = req.Comment;

            await _reviewRepo.SaveChangesAsync();
        }

        public async Task<List<ReviewResponse>> GetAllReviewsByAdminAsync()
        {
            var reviews = await _reviewRepo.GetAllAsync();

            return reviews.Select(r => new ReviewResponse
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserName = r.User?.Name ?? "Ẩn danh",
                ProductName = r.Product?.Name ?? "Sản phẩm không tồn tại",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList();
        }
    }
}