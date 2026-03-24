using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

[ApiController]
[Authorize]
[Route("api/addresses")]
public class AddressController : ControllerBase
{
    private readonly IAddressService _service;

    public AddressController(IAddressService service)
    {
        _service = service;
    }

    [HttpGet("my-addresses")]
    public async Task<IActionResult> GetMyAddresses()
    {
        var userId = GetUserId();
        return Ok(await _service.GetMyAddressesAsync(userId));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var result = await _service.GetByIdAsync(userId, id);

        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("create-address")]
    public async Task<IActionResult> Create(CreateAddressDTO dto)
    {
        var userId = GetUserId();
        var result = await _service.CreateAsync(userId, dto);
        return Ok(new{ message = "Address created successfully", data = result });
    }

    [HttpPut("update-address/{id}")]
    public async Task<IActionResult> Update(int id, UpdateAddressDTO dto)
    {
        var userId = GetUserId();
        var result = await _service.UpdateAsync(userId, id, dto);

        if (result == null) return NotFound();
        return Ok(new{ message = "Address updated successfully", data = result });
    }

    [HttpDelete("delete-address/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var success = await _service.DeleteAsync(userId, id);

        if (!success) return NotFound();
        return Ok(new{ message = "Address deleted successfully" });
    }

    private Guid GetUserId()
    {        
        return (Guid)HttpContext.Items["UserId"]!;
    }
}