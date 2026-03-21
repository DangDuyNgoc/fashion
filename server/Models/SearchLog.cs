using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class SearchLog
    {
        public int Id { get; set; }

        [ForeignKey("UserId")]
        public Guid UserId { get; set; }

        public string Keyword { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}