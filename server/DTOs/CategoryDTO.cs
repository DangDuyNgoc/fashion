using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class CategoryDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }

        public class CategoryCreateDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }

    public class CategoryUpdateDTO
    {        
        [Required]
        public string? Name { get; set; }

        public string? Description { get; set; }
    }
}