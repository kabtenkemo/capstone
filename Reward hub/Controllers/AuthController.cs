using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Reward_hub.Models; // تأكد من المسار الصحيح للـ Models
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RewardHubContext _db;
    private readonly IConfiguration _config;

    public AuthController(RewardHubContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        // 1. البحث عن المستخدم في قاعدة البيانات
        var user = _db.Users.FirstOrDefault(u => u.Email == model.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
            return Unauthorized("البريد الإلكتروني أو كلمة المرور غير صحيحة");

        // 2. توليد التوكن
        var token = GenerateJwtToken(user);

        return Ok(new { Token = token, Role = user.UserRole });
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // إضافة المعلومات المطلوبة كـ Claims
        var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Username),
        new Claim("userId", user.UserId.ToString()),
        new Claim(ClaimTypes.Role, user.UserRole), // السطر الأهم لحل مشكلة الـ 403
        new Claim("level", user.LevelId.ToString()),
        new Claim("points", user.Points.ToString()),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(double.Parse(jwtSettings["DurationInMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterModel model)
    {
        // 1. التحقق من عدم وجود المستخدم مسبقاً
        if (_db.Users.Any(u => u.Email == model.Email))
            return BadRequest("البريد الإلكتروني مستخدم بالفعل");

        // 2. تشفير كلمة المرور
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

        // 3. إنشاء المستخدم الجديد
        var newUser = new User
        {
            Username = model.Username,
            Email = model.Email,
            PasswordHash = passwordHash,
            UserRole = model.UserRole, // تأكد أن الـ Enum أو الـ String متوافق
            Points = 0,
            LevelId = 1, // المستوى المبدئي
            ClassId = model.ClassID
        };

        // 4. الحفظ في قاعدة البيانات
        // أضف هذا السطر لمراقبة ما يتم إرساله
        Console.WriteLine($"Registering User: {newUser.Username}, ClassID: {newUser.ClassId}");

        // أضف هذا التحقق البسيط
        var classExists = _db.Classes.Any(c => c.ClassId == newUser.ClassId);
        if (!classExists && newUser.ClassId != null)
        {
            return BadRequest($"Error: ClassID {newUser.ClassId} does not exist in database.");
        }

        _db.Users.Add(newUser);
        _db.SaveChanges();

        return Ok("تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن.");
    }
   
    [Authorize] // تأكد أن المستخدم مسجل دخول
    [HttpGet("me")]
    public IActionResult GetProfile()
    {
        // استخراج الـ ID من الـ Claims الخاصة بالتوكن
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (userIdClaim == null) return Unauthorized();

        int userId = int.Parse(userIdClaim);

        // جلب بيانات المستخدم مع بيانات الفصل (Include)
        var user = _db.Users
            .Include(u => u.Class) // لجلب اسم الفصل
            .Include(u => u.Level) // لجلب اسم المستوى
            .FirstOrDefault(u => u.UserId == userId);

        if (user == null) return NotFound("User not found");

        // إرجاع البيانات كاملة
        return Ok(new
        {
            user.UserId,
            user.Username,
            user.Email,
            user.Points,
            level = user.Level?.LevelName,
            className = user.Class?.ClassName,
            userRole = user.UserRole
        });
    }

    [Authorize]
    [HttpGet("students")]
    public IActionResult GetStudents()
    {
        var students = _db.Users
            .Include(u => u.Class)
            .Where(u => u.UserRole == "Student")
            .OrderBy(u => u.Username)
            .Select(u => new
            {
                u.UserId,
                u.Username,
                u.ClassId,
                u.ParentId,
                className = u.Class != null ? u.Class.ClassName : null
            })
            .ToList();

        return Ok(students);
    }

    [Authorize]
    [HttpGet("child")]
    public IActionResult GetChild()
    {
        var parentIdClaim = User.FindFirst("userId")?.Value;
        if (parentIdClaim == null) return Unauthorized();

        var parentId = int.Parse(parentIdClaim);

        var child = _db.Users
            .Include(u => u.Class)
            .Include(u => u.Level)
            .FirstOrDefault(u => u.ParentId == parentId && u.UserRole == "Student");

        if (child == null)
        {
            return NotFound("Child not found");
        }

        return Ok(new
        {
            child.UserId,
            child.Username,
            child.Email,
            child.Points,
            level = child.Level?.LevelName,
            className = child.Class?.ClassName,
            userRole = child.UserRole
        });
    }
}

// كلاس الموديل للاستقبال
public class LoginModel
{
    public string Email { get; set; }
    public string Password { get; set; }
}