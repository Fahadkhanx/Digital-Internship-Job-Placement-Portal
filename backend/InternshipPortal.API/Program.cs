using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using InternshipPortal.API.Data;
using InternshipPortal.API.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to use string names for enums
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 21))
    )
);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IEmployerService, EmployerService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IBookmarkService, BookmarkService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IMeetingService, MeetingService>();

var app = builder.Build();

// Test database connection
try
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var canConnect = context.Database.CanConnect();
    if (!canConnect)
    {
        Console.WriteLine("⚠ Warning: Cannot connect to database. Please check your connection string.");
    }
    else
    {
        Console.WriteLine("✓ Database connection successful!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"✗ Database connection error: {ex.Message}");
    Console.WriteLine("   Please check your connection string in appsettings.json");
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Internship Portal API v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}

// Only redirect HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Serve static files (for uploads)
app.UseStaticFiles();

// Serve uploads folder from ContentRootPath
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
    Directory.CreateDirectory(Path.Combine(uploadsPath, "resumes"));
    Directory.CreateDirectory(Path.Combine(uploadsPath, "profiles"));
    Directory.CreateDirectory(Path.Combine(uploadsPath, "logos"));
    Directory.CreateDirectory(Path.Combine(uploadsPath, "messages"));
    Directory.CreateDirectory(Path.Combine(uploadsPath, "messages", "images"));
    Directory.CreateDirectory(Path.Combine(uploadsPath, "messages", "videos"));
    Directory.CreateDirectory(Path.Combine(uploadsPath, "messages", "documents"));
    Directory.CreateDirectory(Path.Combine(uploadsPath, "messages", "voice"));
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var urls = app.Configuration["Urls"] ?? "http://localhost:5000";
Console.WriteLine("\n🚀 API Server Starting...");
Console.WriteLine($"📍 API URL: {urls}");
Console.WriteLine($"📍 Swagger UI: http://localhost:5000/swagger");
Console.WriteLine($"📍 Health Check: http://localhost:5000/api/health");
Console.WriteLine($"📍 Frontend should use: http://localhost:5000/api\n");

app.Run();
