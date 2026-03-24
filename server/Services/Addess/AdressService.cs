using server.DTOs;
using server.Models;
using server.Repositories;

public class AddressService : IAddressService
{
    private readonly IAddressRepository _repo;

    public AddressService(IAddressRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<AddressDTO>> GetMyAddressesAsync(Guid userId)
    {
        var addresses = await _repo.GetByUserIdAsync(userId);
        return addresses.Select(MapToDTO).ToList();
    }

    public async Task<AddressDTO> CreateAsync(Guid userId, CreateAddressDTO dto)
    {
        var addresses = await _repo.GetByUserIdAsync(userId);

        if (dto.IsDefault)
        {
            foreach (var addr in addresses)
                addr.IsDefault = false;
        }
        else if (!addresses.Any())
        {
            dto.IsDefault = true;
        }

        var address = new Address
        {
            UserId = userId,
            AddressLine = dto.AddressLine,
            City = dto.City,
            District = dto.District,
            IsDefault = dto.IsDefault
        };

        await _repo.AddAsync(address);
        await _repo.SaveChangesAsync();

        return MapToDTO(address);
    }

    public async Task<AddressDTO?> UpdateAsync(Guid userId, int id, UpdateAddressDTO dto)
    {
        var address = await _repo.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            return null;

        var addresses = await _repo.GetByUserIdAsync(userId);

        if (dto.IsDefault)
        {
            foreach (var addr in addresses)
                addr.IsDefault = false;
        }

        address.AddressLine = dto.AddressLine;
        address.City = dto.City;
        address.District = dto.District;
        address.IsDefault = dto.IsDefault;

        _repo.Update(address);
        await _repo.SaveChangesAsync();

        return MapToDTO(address);
    }

    public async Task<bool> DeleteAsync(Guid userId, int id)
    {
        var address = await _repo.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            return false;

        bool wasDefault = address.IsDefault;

        _repo.Delete(address);
        await _repo.SaveChangesAsync();

        if (wasDefault)
        {
            var addresses = await _repo.GetByUserIdAsync(userId);
            var first = addresses.FirstOrDefault();
            if (first != null)
            {
                first.IsDefault = true;
                await _repo.SaveChangesAsync();
            }
        }

        return true;
    }

    public async Task<AddressDTO?> GetByIdAsync(Guid userId, int id)
    {
        var address = await _repo.GetByIdAsync(id);
        if (address == null || address.UserId != userId)
            return null;

        return MapToDTO(address);
    }

    // ================= MAPPER =================
    private AddressDTO MapToDTO(Address a)
    {
        return new AddressDTO
        {
            Id = a.Id,
            AddressLine = a.AddressLine,
            City = a.City,
            District = a.District,
            IsDefault = a.IsDefault
        };
    }
}