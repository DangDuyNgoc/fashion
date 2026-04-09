namespace server.DTOs
{
    public class AiSuggestionResponse
    {
        public List<ProductDTO> Products { get; set; } = new();
        public string AiMessage { get; set; } = string.Empty;
    }
}
