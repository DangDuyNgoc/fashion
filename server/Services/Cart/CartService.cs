using server.DTOs;
using server.Models;
using server.Repositories;

namespace server.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _repo;
        private readonly IProductVariantRepository _variantRepo;

        public CartService(ICartRepository repo, IProductVariantRepository variantRepo)
        {
            _repo = repo;
            _variantRepo = variantRepo;
        }

        public async Task<CartDTO> GetCartAsync(Guid userId)
        {
            var cart = await _repo.GetByUserIdAsync(userId);

            if (cart == null)
            {
                cart = await _repo.CreateAsync(new Cart
                {
                    UserId = userId,
                    Items = new List<CartItem>()
                });
            }

            return MapToDTO(cart);
        }

        public async Task<CartDTO> AddToCartAsync(Guid userId, AddToCartDTO dto)
        {
            var cart = await _repo.GetByUserIdAsync(userId);

            if (cart == null)
            {
                cart = await _repo.CreateAsync(new Cart
                {
                    UserId = userId,
                    Items = new List<CartItem>()
                });
            }

            var variant = await _variantRepo.GetById(dto.VariantId);
            if (variant == null) throw new Exception("Product variant not found");

            var existingItem = cart.Items
                .FirstOrDefault(i => i.VariantId == dto.VariantId);

            int newQuantity = dto.Quantity;

            if (existingItem != null)
            {
                newQuantity += existingItem.Quantity;
            }

            if (newQuantity > variant.Stock)
                throw new Exception("Not enough stock");

            if(existingItem != null)
            {
                existingItem.Quantity = newQuantity;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    VariantId = dto.VariantId,
                    Quantity = dto.Quantity
                });
            }

            await _repo.UpdateAsync(cart);
            cart = await _repo.GetByUserIdAsync(userId);
            return MapToDTO(cart!);
        }

        public async Task<CartDTO> UpdateItemAsync(Guid userId, int itemId, UpdateCartItemDTO dto)
        {
            var cart = await _repo.GetByUserIdAsync(userId);
            if (cart == null) throw new Exception("Cart not found");

            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) throw new Exception("Item not found");

            if (dto.Quantity <= 0)
                throw new Exception("Quantity must be greater than 0");

            var newVariant = await _variantRepo.GetById(dto.VariantId);
            if (newVariant == null) throw new Exception("Product variant not found");

            var existingItem = cart.Items
                .FirstOrDefault(i => i.VariantId == dto.VariantId && i.Id != itemId);
            
            int newQuantity = dto.Quantity;

            if (existingItem != null)
            {
                newQuantity += existingItem.Quantity;
            }

            if (newQuantity > newVariant.Stock)
                throw new Exception("Not enough stock");

             if (existingItem != null)
            {
                existingItem.Quantity = newQuantity;
                cart.Items.Remove(item);
            }
            else
            {
                item.VariantId = dto.VariantId;
                item.Quantity = dto.Quantity;
            }

            await _repo.UpdateAsync(cart);
            cart = await _repo.GetByUserIdAsync(userId);
            return MapToDTO(cart!);
        }

        public async Task<bool> RemoveItemAsync(Guid userId, int itemId)
        {
            var cart = await _repo.GetByUserIdAsync(userId);
            if (cart == null) throw new Exception("Cart not found");

            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) throw new Exception("Item not found");

            cart.Items.Remove(item);
            await _repo.UpdateAsync(cart);

            return true ;
        }

        // ================= MAP =================
        private CartDTO MapToDTO(Cart cart)
        {
            return new CartDTO
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = cart.Items.Select(i => new CartItemDTO
                {
                    Id = i.Id,
                    VariantId = i.VariantId,
                    ProductName = i.Variant.Product.Name,
                    VariantName = $"{i.Variant.Color} - {i.Variant.Size}",
                    Price = i.Variant.Product.Price,
                    Quantity = i.Quantity,
                    ImageUrl = i.Variant.Product.Images.FirstOrDefault()?.ImageUrl ?? ""
                }).ToList()
            };
        }
    }
}