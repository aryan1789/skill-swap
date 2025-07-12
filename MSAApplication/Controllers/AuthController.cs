using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Supabase;

namespace MSAApplication.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly Client _supabase;

        public AuthController(Client supabase)
        {
            _supabase = supabase;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRequest request)
        {
            try
            {
                var session = await _supabase.Auth.SignUp(request.Email, request.Password);

                if (session?.User != null)
                    return Ok(new { message = "Registration successful", user = session.User });

                return BadRequest(new { error = "Registration failed" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            var session = await _supabase.Auth.SignIn(request.Email, request.Password);

            if (session != null && session.User != null)
                return Ok(new { token = session.AccessToken, user = session.User });

            return Unauthorized(new { error = "Invalid credentials" });
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUser([FromHeader(Name = "Authorization")] string bearer)
        {
            var token = bearer.Replace("Bearer ", "");
            var user = await _supabase.Auth.GetUser(token);

            if (user != null)
                return Ok(user);

            return Unauthorized();
        }
    }

    public class AuthRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
        
