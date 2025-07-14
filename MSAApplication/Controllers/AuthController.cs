using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MSAApplication.Context;
using MSAApplication.Models;
using Supabase;

namespace MSAApplication.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly Client _supabase;
        private readonly AppDbContext _context;
        public AuthController(Client supabase,AppDbContext context)
        {
            _supabase = supabase;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                Console.WriteLine($"Registering user: {request.Email}");

                var session = await _supabase.Auth.SignUp(request.Email, request.Password);

                if (session?.User != null)
                {
                    var supabaseUserId = session.User.Id;
                    Console.WriteLine($"Supabase ID received: {supabaseUserId}");

                    var existingUser = _context.Users.FirstOrDefault(u => u.SupabaseUserId == supabaseUserId);
                    if (existingUser == null)
                    {
                        var newUser = new User
                        {
                            SupabaseUserId = supabaseUserId,
                            Email = session.User.Email ?? request.Email,
                            Name = request.Name ?? "",
                            Occupation = request.Occupation ?? "",
                            CreatedAt = DateTime.UtcNow,
                            ProfilePictureUrl = null
                        };
                        _context.Users.Add(newUser);
                        await _context.SaveChangesAsync();

                        Console.WriteLine("Saved new user to SQL DB.");
                    }
                    return Ok(new { message = "Registration successful", user = session.User });

                }

                return BadRequest(new { error = "Registration failed" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Registration Failed: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            try
            {
                var session = await _supabase.Auth.SignIn(request.Email, request.Password);

                if (session != null && session.User != null)
                    return Ok(new { token = session.AccessToken, user = session.User });

                return Unauthorized(new { error = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpGet("user")]
        public async Task<IActionResult> GetUser([FromHeader(Name = "Authorization")] string bearer)
        {
            if (string.IsNullOrWhiteSpace(bearer))
                return Unauthorized(new { error = "Missing Authorization header" });

            var token = bearer.Replace("Bearer ", "");
            var user = await _supabase.Auth.GetUser(token);

            if (user != null)
                return Ok(user);

            return Unauthorized();
        }
    }

    
}
        
