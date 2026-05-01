using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Reward_hub.Models;
using System.Text;

namespace Reward_hub
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 1. تسجيل الـ DbContext
            builder.Services.AddDbContext<RewardHubContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // 2. إعداد الـ Authentication (JWT)
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                        ValidateIssuer = false,
                        ValidateAudience = false
                    };
                });

            builder.Services.AddAuthorization();
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            // إضافة سياسة CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
            });

            // 3. إعداد Swagger
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "أدخل الـ Token بهذا الشكل: Bearer {token}"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        new string[] {}
                    }
                });
            });

            builder.Services.AddHealthChecks();

            // 4. تفعيل الـ CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Reward Hub API v1");
                    options.RoutePrefix = "swagger";
                });
            }

            app.UseCors("AllowAll");
            app.UseHttpsRedirection();

            // الترتيب هام جداً هنا:
            app.UseAuthentication(); // يجب أن تأتي قبل Authorization
            app.UseAuthorization();

            app.MapControllers();
            app.MapHealthChecks("/api/health");

            SeedDevelopmentData(app);

            app.Run();
        }

        private static void SeedDevelopmentData(WebApplication app)
        {
            // Seed demo data when missing. Run in all environments so local testing
            // works even if ASPNETCORE_ENVIRONMENT isn't set to Development.

            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<RewardHubContext>();

            if (!db.Classes.Any(c => c.ClassName == "Class A"))
            {
                db.Classes.Add(new Class { ClassName = "Class A" });
            }

            if (!db.Classes.Any(c => c.ClassName == "Class B"))
            {
                db.Classes.Add(new Class { ClassName = "Class B" });
            }

            // Read existing level names with a projection to avoid tracking Level entities
            // Attempt to find existing levels; if none exist we will proceed without creating them
            // to avoid schema/identity mismatches on different local databases.

            db.SaveChanges();

            var classA = db.Classes.First(c => c.ClassName == "Class A");
            var classB = db.Classes.First(c => c.ClassName == "Class B");
            var starterLevel = db.Levels.FirstOrDefault(l => l.LevelName == "Starter");
            var bronzeLevel = db.Levels.FirstOrDefault(l => l.LevelName == "Bronze");
            var silverLevel = db.Levels.FirstOrDefault(l => l.LevelName == "Silver");

            int? starterLevelId = starterLevel?.LevelId;
            int? bronzeLevelId = bronzeLevel?.LevelId;
            int? silverLevelId = silverLevel?.LevelId;

            var parent = EnsureUser(db, "Demo Parent", "parent@rewardhub.local", "Parent@1234", "Parent", null, bronzeLevelId, null, 180);
            var admin = EnsureUser(db, "Demo Admin", "admin@rewardhub.local", "Admin@1234", "Admin", null, silverLevelId, null, 420);
            var teacher = EnsureUser(db, "Demo Teacher", "teacher@rewardhub.local", "Teacher@1234", "Teacher", classA.ClassId, silverLevelId, null, 350);
            var studentOne = EnsureUser(db, "Ali Student", "student1@rewardhub.local", "Student@1234", "Student", classA.ClassId, starterLevelId, parent.UserId, 125);
            var studentTwo = EnsureUser(db, "Sara Student", "student2@rewardhub.local", "Student@1234", "Student", classB.ClassId, bronzeLevelId, parent.UserId, 275);

            // Add 10+ more students
            var student3 = EnsureUser(db, "Ahmed Hassan", "student3@rewardhub.local", "Student@1234", "Student", classA.ClassId, bronzeLevelId, parent.UserId, 185);
            var student4 = EnsureUser(db, "Fatima Karim", "student4@rewardhub.local", "Student@1234", "Student", classB.ClassId, starterLevelId, parent.UserId, 95);
            var student5 = EnsureUser(db, "Mohamed Ali", "student5@rewardhub.local", "Student@1234", "Student", classA.ClassId, silverLevelId, parent.UserId, 340);
            var student6 = EnsureUser(db, "Noor Ibrahim", "student6@rewardhub.local", "Student@1234", "Student", classB.ClassId, bronzeLevelId, parent.UserId, 210);
            var student7 = EnsureUser(db, "Zainab Mahmoud", "student7@rewardhub.local", "Student@1234", "Student", classA.ClassId, starterLevelId, parent.UserId, 140);
            var student8 = EnsureUser(db, "Karim Youssef", "student8@rewardhub.local", "Student@1234", "Student", classB.ClassId, silverLevelId, parent.UserId, 380);
            var student9 = EnsureUser(db, "Layla Hassan", "student9@rewardhub.local", "Student@1234", "Student", classA.ClassId, bronzeLevelId, parent.UserId, 165);
            var student10 = EnsureUser(db, "Omar Hassan", "student10@rewardhub.local", "Student@1234", "Student", classB.ClassId, starterLevelId, parent.UserId, 110);
            var student11 = EnsureUser(db, "Hana Khaled", "student11@rewardhub.local", "Student@1234", "Student", classA.ClassId, silverLevelId, parent.UserId, 365);
            var student12 = EnsureUser(db, "Rami Samir", "student12@rewardhub.local", "Student@1234", "Student", classB.ClassId, bronzeLevelId, parent.UserId, 240);

            if (!db.PointHistories.Any(history => history.StudentId == studentOne.UserId && history.Reason == "Great class participation"))
            {
                db.PointHistories.Add(new PointHistory
                {
                    StudentId = studentOne.UserId,
                    TeacherId = teacher.UserId,
                    Amount = 25,
                    Reason = "Great class participation",
                    CreatedAt = DateTime.Now.AddDays(-2)
                });
            }

            if (!db.PointHistories.Any(history => history.StudentId == studentTwo.UserId && history.Reason == "Excellent homework"))
            {
                db.PointHistories.Add(new PointHistory
                {
                    StudentId = studentTwo.UserId,
                    TeacherId = teacher.UserId,
                    Amount = 40,
                    Reason = "Excellent homework",
                    CreatedAt = DateTime.Now.AddDays(-1)
                });
            }

            if (!db.Comments.Any(comment => comment.TargetUserId == studentOne.UserId && comment.Content == "Keep up the momentum!"))
            {
                db.Comments.Add(new Comment
                {
                    AuthorId = teacher.UserId,
                    TargetUserId = studentOne.UserId,
                    Content = "Keep up the momentum!",
                    CreatedAt = DateTime.Now.AddDays(-2)
                });
            }

            if (!db.Comments.Any(comment => comment.TargetUserId == studentTwo.UserId && comment.Content == "Outstanding progress this week."))
            {
                db.Comments.Add(new Comment
                {
                    AuthorId = parent.UserId,
                    TargetUserId = studentTwo.UserId,
                    Content = "Outstanding progress this week.",
                    CreatedAt = DateTime.Now.AddDays(-1)
                });
            }

            db.SaveChanges();
        }

        private static User EnsureUser(RewardHubContext db, string username, string email, string password, string role, int? classId, int? levelId, int? parentId, int points)
        {
            var existing = db.Users.FirstOrDefault(user => user.Email == email);
            if (existing != null)
            {
                return existing;
            }

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                UserRole = role,
                ClassId = classId,
                LevelId = levelId,
                ParentId = parentId,
                Points = points
            };

            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }
    }
}