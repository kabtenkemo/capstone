using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reward_hub.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly RewardHubContext _db;

    public CommentsController(RewardHubContext db)
    {
        _db = db;
    }

    // 1. إضافة تعليق لطالب معين
    [HttpPost("add")]
    public IActionResult AddComment([FromBody] CommentRequest request)
    {
        var authorId = int.Parse(User.FindFirst("userId")?.Value);

        var comment = new Comment
        {
            Content = request.Content,
            AuthorId = authorId,
            TargetUserId = request.TargetUserId,
            CreatedAt = DateTime.Now
        };

        _db.Comments.Add(comment);
        _db.SaveChanges();

        return Ok(new { message = "تم إضافة التعليق بنجاح" });
    }

    // 2. جلب كل التعليقات (مع بيانات الكاتب والمستهدف)
    [HttpGet("all")]
    public IActionResult GetAllComments()
    {
        var comments = _db.Comments
            .Include(c => c.Author)
            .Include(c => c.TargetUser)
            .Select(c => new {
                c.CommentId,
                c.Content,
                AuthorName = c.Author.Username,
                TargetStudentName = c.TargetUser.Username,
                c.CreatedAt
            })
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

        return Ok(comments);
    }

    [Authorize]
    [HttpGet("student/{studentId}")]
    public IActionResult GetCommentsByStudent(int studentId)
    {
        var currentUserId = int.Parse(User.FindFirst("userId")?.Value);
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // --- نظام التحقق من الصلاحية ---
        if (currentUserRole == "Parent")
        {
            bool isMyChild = _db.Users.Any(u => u.UserId == studentId && u.ParentId == currentUserId);
            if (!isMyChild) return Forbid("لا يمكنك عرض تعليقات طلاب ليسوا أبناءك");
        }
        else if (currentUserRole == "Student")
        {
            if (currentUserId != studentId) return Forbid("لا يمكنك رؤية تعليقات زملائك");
        }

        var comments = _db.Comments
            .Where(c => c.TargetUserId == studentId)
            .Include(c => c.Author)
            .Select(c => new {
                c.CommentId,
                c.Content,
                c.CreatedAt,
                AuthorName = c.Author.Username,
                AuthorRole = c.Author.UserRole
            })
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

        return Ok(comments);
    }
}

public class CommentRequest
{
    public string Content { get; set; }
    public int TargetUserId { get; set; }
}