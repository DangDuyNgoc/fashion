using server.Models;

public interface IAddressRepository
{
    Task<List<Address>> GetByUserIdAsync(Guid userId);
    Task<Address?> GetByIdAsync(int id);
    Task<Address?> GetDefaultAsync(Guid userId);
    Task AddAsync(Address address);
    void Update(Address address);
    void Delete(Address address);
    Task SaveChangesAsync();
}