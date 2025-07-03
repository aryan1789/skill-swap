using Microsoft.AspNetCore.Mvc;
using MSAApplication.Context;
using MSAApplication.Models;

namespace MSAApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;

            if (!_context.Users.Any())
            {
                _context.Users.AddRange(new[]
                {
                    new User { Name= "Aryan", Email= "aryan@example.com",Password="Password",Bio="SWE Student" },
                    new User { Name= "Teena", Email= "teena@example.com",Password="Password",Bio= "Operations Lead" }
                });

                _context.SaveChanges();
            }
        }

        [HttpGet]
        public ActionResult<IEnumerable<User>> GetUsers()
        {
            return Ok(_context.Users.ToList());
        }
    }
}
