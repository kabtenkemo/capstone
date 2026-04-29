public class RegisterModel
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public int? ClassID { get; set; } // اختياري
    public string UserRole { get; set; } = "Student"; // افتراضي
}