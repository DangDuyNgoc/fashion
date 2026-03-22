using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

namespace server.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        // GET ALL
        [HttpGet("get-all-categories")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();

            return Ok(new
            {
                message = "Get categories successfully",
                data
            });
        }

        // GET BY ID
        [HttpGet("get-category/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return NotFound(new { message = "Category not found" });

            return Ok(new
            {
                message = "Get category successfully",
                data
            });
        }

        // CREATE
        [HttpPost("create-category")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Create(CategoryCreateDTO dto)
        {
            var created = await _service.CreateAsync(dto);

            return Ok(new
            {
                message = "Created successfully",
                data = created
            });
        }

        // UPDATE
        [HttpPut("update-category/{id}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Update(int id, CategoryUpdateDTO dto)
        {
            var updated = await _service.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound(new { message = "Category not found" });

            return Ok(new
            {
                message = "Updated successfully",
                data = updated
            });
        }

        // DELETE
        [HttpDelete("delete-category/{id}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
                return NotFound(new { message = "Category not found" });

            return Ok(new
            {
                message = "Deleted successfully"
            });
        }
    }
}