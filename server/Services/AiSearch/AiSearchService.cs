using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using server.DTOs;
using server.Models;
using server.Repositories;

namespace server.Services
{
    public class AiSearchService : IAiSearchService
    {
        private readonly IProductRepository _productRepo;
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private readonly string _apiKey;
        private readonly ILogger<AiSearchService> _logger;

        private const string GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
        private const string MODEL = "llama-3.3-70b-versatile";
        private const string CATALOG_CACHE_KEY = "product_catalog_for_ai";

        public AiSearchService(
            IProductRepository productRepo,
            HttpClient httpClient,
            IMemoryCache cache,
            IConfiguration config,
            ILogger<AiSearchService> logger)
        {
            _productRepo = productRepo;
            _httpClient = httpClient;
            _cache = cache;
            _apiKey = config["Groq:ApiKey"] ?? throw new Exception("GROQ_API_KEY is not configured");
            _logger = logger;
        }

        public async Task<AiSuggestionResponse> SearchAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new AiSuggestionResponse();

            try
            {
                var products = await GetCachedProductsAsync();

                if (products.Count == 0)
                    return new AiSuggestionResponse { AiMessage = "Chưa có sản phẩm nào trong cửa hàng." };

                var prompt = BuildPrompt(query, products);

                var aiResponse = await CallGroqAsync(prompt);

                var (productIds, aiMessage) = ParseAiResponse(aiResponse);

                var matchedProducts = productIds
                    .Select(id => products.FirstOrDefault(p => p.Id == id))
                    .Where(p => p != null)
                    .Select(p => MapToDTO(p!))
                    .ToList();

                return new AiSuggestionResponse
                {
                    Products = matchedProducts!,
                    AiMessage = aiMessage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI Search failed for query: {Query}", query);
                return new AiSuggestionResponse
                {
                    Products = new List<ProductDTO>(),
                    AiMessage = "Không thể tìm kiếm bằng AI lúc này."
                };
            }
        }

        // ================= HELPERS =================

        private async Task<List<Product>> GetCachedProductsAsync()
        {
            if (_cache.TryGetValue(CATALOG_CACHE_KEY, out List<Product>? cached) && cached != null)
                return cached;

            var products = await _productRepo.GetAllAsync();

            _cache.Set(CATALOG_CACHE_KEY, products, TimeSpan.FromMinutes(5));
            return products;
        }

        private string BuildPrompt(string query, List<Product> products)
        {
            var catalog = new StringBuilder();
            foreach (var p in products)
            {
                var colors = p.Variants?.Select(v => v.Color).Distinct().ToList() ?? new List<string>();
                var sizes = p.Variants?.Select(v => v.Size).Distinct().ToList() ?? new List<string>();
                catalog.AppendLine($"- ID:{p.Id} | Tên: {p.Name} | Mô tả: {p.Description} | Giá: {p.Price:N0}đ | Danh mục: {p.Category?.Name ?? "N/A"} | Màu: {string.Join(", ", colors)} | Size: {string.Join(", ", sizes)}");
            }

            return $@"Bạn là trợ lý tìm kiếm sản phẩm thời trang. Người dùng tìm kiếm: ""{query}""

Danh sách sản phẩm:
{catalog}

Hãy tìm những sản phẩm phù hợp nhất với yêu cầu của người dùng. Hiểu ngữ cảnh, từ đồng nghĩa, và ý định tìm kiếm (ví dụ: ""áo mùa hè"" → áo thun, tank top, crop top; ""quà tặng bạn gái"" → váy, túi, phụ kiện).

Trả lời ĐÚNG THEO FORMAT JSON sau (KHÔNG thêm markdown, KHÔNG thêm ```):
{{
  ""ids"": [1, 5, 3],
  ""message"": ""Giải thích ngắn gọn bằng tiếng Việt tại sao các sản phẩm này phù hợp (1-2 câu)""
}}

Quy tắc:
- Trả về tối đa 8 sản phẩm, sắp xếp theo độ phù hợp giảm dần
- Nếu không tìm thấy sản phẩm phù hợp, trả về ids rỗng: {{""ids"": [], ""message"": ""Không tìm thấy sản phẩm phù hợp""}}
- CHỈ trả về JSON thuần, không có ký tự nào khác";
        }

        private async Task<string> CallGroqAsync(string prompt)
        {
            var requestBody = new
            {
                model = MODEL,
                messages = new[]
                {
                    new { role = "system", content = "You are a fashion product search assistant. Always respond with valid JSON only." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.3,
                max_tokens = 300
            };

            var json = JsonSerializer.Serialize(requestBody);

            const int maxRetries = 3;
            for (int attempt = 0; attempt <= maxRetries; attempt++)
            {
                var request = new HttpRequestMessage(HttpMethod.Post, GROQ_URL);
                request.Headers.Add("Authorization", $"Bearer {_apiKey}");
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);

                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    if (attempt < maxRetries)
                    {
                        var delay = (int)Math.Pow(2, attempt) * 1000;
                        _logger.LogWarning("Groq API rate limited (429). Retrying in {Delay}ms (attempt {Attempt}/{MaxRetries})", delay, attempt + 1, maxRetries);
                        await Task.Delay(delay);
                        continue;
                    }

                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API rate limited after {MaxRetries} retries. Response: {Error}", maxRetries, errorBody);
                    throw new Exception($"Groq API rate limited after {maxRetries} retries");
                }

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error {StatusCode}: {Error}", response.StatusCode, errorBody);
                    throw new Exception($"Groq API error: {response.StatusCode}");
                }

                return await response.Content.ReadAsStringAsync();
            }

            throw new Exception("Groq API call failed after all retries");
        }

        private (List<int> ids, string message) ParseAiResponse(string responseJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseJson);

                // Groq uses OpenAI format: choices[0].message.content
                var textContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrEmpty(textContent))
                    return (new List<int>(), "Không có kết quả");

                textContent = textContent
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                using var parsed = JsonDocument.Parse(textContent);

                var ids = parsed.RootElement
                    .GetProperty("ids")
                    .EnumerateArray()
                    .Select(e => e.GetInt32())
                    .ToList();

                var message = parsed.RootElement
                    .GetProperty("message")
                    .GetString() ?? "";

                return (ids, message);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse AI response");
                return (new List<int>(), "Không thể xử lý kết quả AI");
            }
        }

        private ProductDTO MapToDTO(Product p)
        {
            return new ProductDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? "",
                CreatedAt = p.CreatedAt,
                Variants = p.Variants?.Select(v => new ProductVariantDTO
                {
                    Id = v.Id,
                    ProductId = v.ProductId,
                    Color = v.Color,
                    Size = v.Size,
                    Stock = v.Stock
                }).ToList() ?? new List<ProductVariantDTO>(),
                Images = p.Images?.Select(i => new ProductImageDTO
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ImageUrl = i.ImageUrl
                }).ToList() ?? new List<ProductImageDTO>(),
            };
        }
    }
}
