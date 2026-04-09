using server.DTOs;

namespace server.Services
{
    public interface IAiSearchService
    {
        Task<AiSuggestionResponse> SearchAsync(string query);
    }
}
