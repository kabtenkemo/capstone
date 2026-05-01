using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reward_hub.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PointsController : ControllerBase
{
    private readonly RewardHubContext _db;

    public PointsController(RewardHubContext db)
    {
        _db = db;
    }

    [Authorize(Roles = "Teacher,Admin")]
    [HttpPost("add")]
    public IActionResult AddPoints([FromBody] PointRequest request)
    {
        var student = _db.Users.Include(u => u.Level).FirstOrDefault(u => u.UserId == request.StudentId);
        if (student == null) return NotFound("Student not found");

        // 1. زيادة النقاط
        student.Points += Math.Abs(request.Amount);

        // 2. التحقق من المستوى الجديد تلقائياً
        // جلب أعلى مستوى ممكن للطالب بناءً على نقاطه الحالية
        var nextLevel = _db.Levels
            .Where(l => student.Points >= l.RequiredPoints)
            .OrderByDescending(l => l.RequiredPoints)
            .FirstOrDefault();

        if (nextLevel != null && nextLevel.LevelId != student.LevelId)
        {
            student.LevelId = nextLevel.LevelId;
        }

        // 3. حفظ السجل
        var history = new PointHistory
        {
            StudentId = student.UserId,
            TeacherId = int.Parse(User.FindFirst("userId")?.Value),
            Amount = request.Amount,
            Reason = request.Reason,
            CreatedAt = DateTime.Now
        };

        _db.PointHistories.Add(history);
        _db.SaveChanges();

        return Ok(new
        {
            message = "Points added and level checked",
            currentPoints = student.Points,
            currentLevel = nextLevel?.LevelName
        });
    }

    // 2. خصم نقاط من الطالب
    [Authorize(Roles = "Teacher,Admin")]
    [HttpPost("deduct")]
    public IActionResult DeductPoints([FromBody] PointRequest request)
    {
        var student = _db.Users.Find(request.StudentId);
        if (student == null) return NotFound("الطالب غير موجود");

        var teacherId = int.Parse(User.FindFirst("userId")?.Value);

        // خصم النقاط مع التأكد ألا تقل عن صفر
        student.Points -= Math.Abs(request.Amount);
        if (student.Points < 0) student.Points = 0;

        var history = new PointHistory
        {
            StudentId = request.StudentId,
            TeacherId = teacherId,
            Amount = -Math.Abs(request.Amount), // تخزين القيمة بالسالب في السجل
            Reason = request.Reason,
            CreatedAt = DateTime.Now
        };

        _db.PointHistories.Add(history);
        _db.SaveChanges();

        return Ok(new { message = $"تم خصم {request.Amount} نقطة من {student.Username}", currentPoints = student.Points });
    }

    // 3. جلب سجل النقاط بالكامل
    [HttpGet("all-history")]
    public IActionResult GetAllHistory()
    {
        var history = _db.PointHistories
            .Include(p => p.Student)
            .Include(p => p.Teacher)
            .Select(p => new {
                p.HistoryId,
                StudentName = p.Student.Username,
                TeacherName = p.Teacher.Username,
                p.Amount,
                p.Reason,
                p.CreatedAt
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToList();

        return Ok(history);
    }

    [Authorize(Roles = "Teacher,Admin")]
    [HttpGet("class/{classId}")]
    public IActionResult GetHistoryByClass(int classId)
    {
        var history = _db.PointHistories
            .Include(p => p.Student)
            .Include(p => p.Teacher)
            .Where(p => p.Student.ClassId == classId)
            .Select(p => new {
                p.HistoryId,
                StudentName = p.Student.Username,
                StudentClassId = p.Student.ClassId,
                TeacherName = p.Teacher.Username,
                p.Amount,
                p.Reason,
                p.CreatedAt
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToList();

        return Ok(history);
    }


    [Authorize]
    [HttpGet("student/{studentId}")]
    public IActionResult GetPointsByStudent(int studentId)
    {
        var currentUserId = int.Parse(User.FindFirst("userId")?.Value);
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // --- نظام التحقق من الصلاحية ---
        if (currentUserRole == "Parent")
        {
            bool isMyChild = _db.Users.Any(u => u.UserId == studentId && u.ParentId == currentUserId);
            if (!isMyChild) return Forbid("لا يمكنك عرض بيانات طلاب ليسوا أبناءك");
        }
        else if (currentUserRole == "Student")
        {
            // الطالب لا يرى إلا نفسه
            if (currentUserId != studentId) return Forbid("لا يمكنك عرض سجل نقاط طالب آخر");
        }
        // المعلم والمدير (Teacher/Admin) يمرون تلقائياً لمشاهدة أي طالب

        var history = _db.PointHistories
            .Where(p => p.StudentId == studentId)
            .Include(p => p.Teacher)
            .Select(p => new {
                p.HistoryId,
                p.Amount,
                p.Reason,
                p.CreatedAt,
                TeacherName = p.Teacher.Username
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToList();

        return Ok(history);
    }

    [HttpGet("leaderboard")]
    public IActionResult GetLeaderboard()
    {
        var topStudents = _db.Users
            .Where(u => u.UserRole == "Student")
            .Include(u => u.Level) // لجلب اسم المستوى (ذهبي، فضي...)
            .OrderByDescending(u => u.Points)
            .Take(10) // أفضل 10 طلاب
            .Select(u => new {
                u.Username,
                u.Points,
                LevelName = u.Level.LevelName,
                u.ClassId // اختياري إذا أردت إظهار الفصل
            })
            .ToList();

        return Ok(topStudents);
    }
}

// Model موحد لطلبات النقاط
public class PointRequest
{
    public int StudentId { get; set; }
    public int Amount { get; set; }
    public string Reason { get; set; }
}