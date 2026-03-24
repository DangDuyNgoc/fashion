using server.DTOs;

public interface IAddressService
{
    Task<List<AddressDTO>> GetMyAddressesAsync(Guid userId);
    Task<AddressDTO> CreateAsync(Guid userId, CreateAddressDTO dto);
    Task<AddressDTO?> UpdateAsync(Guid userId, int id, UpdateAddressDTO dto);
    Task<bool> DeleteAsync(Guid userId, int id);
    Task<AddressDTO?> GetByIdAsync(Guid userId, int id);
}