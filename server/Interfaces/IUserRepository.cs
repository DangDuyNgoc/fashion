using server.Models;

namespace server.Interfaces
{
    public interface IUserRepository
    {
        User? GetByEmail(string email);
        User? GetById(Guid id);
        User? GetByRefreshToken(string token);
        
        void Add(User user);
        void Update(User user);
        void Remove(User user);
        void Save();
    }
}