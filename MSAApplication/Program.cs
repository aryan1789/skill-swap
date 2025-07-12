using Microsoft.AspNetCore.Connections;
using Microsoft.EntityFrameworkCore;
using MSAApplication.Context;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
Console.WriteLine("=== DEBUG: Using connection string ===");
Console.WriteLine(builder.Configuration.GetConnectionString("DefaultConnection"));
Console.WriteLine("======================================");

builder.Services.AddSingleton(provider =>
{
    var configuration = builder.Configuration;
    var url = configuration["Supabase:Url"];
    var key = configuration["Supabase:Key"];

    var options = new SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = false
    };
    var client = new Supabase.Client(url, key, options);
    client.InitializeAsync().Wait();
    return client;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // Applies pending migrations
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.Run();
