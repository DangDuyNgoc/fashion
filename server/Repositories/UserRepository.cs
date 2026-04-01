using server.Models;
using server.Data;
using server.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace server.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public User? GetByEmail(string email)
        {
            return _context.Users
                .AsNoTracking()
                .FirstOrDefault(x => x.Email == email);   
        }

        public IEnumerable<User> GetAll()
        {
            return _context.Users.AsNoTracking().ToList();
        }
            
        public User? GetById(Guid id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }

        public User? GetByRefreshToken(string token)
            => _context.Users.FirstOrDefault(x =>
                x.RefreshToken == token &&
                x.RefreshTokenExpiry > DateTime.Now);

        public void Add(User user) => _context.Users.Add(user);

        public void Update(User user) => _context.Users.Update(user);

        public void Remove(User user) => _context.Users.Remove(user);

        public void Save() => _context.SaveChanges();
    }
}