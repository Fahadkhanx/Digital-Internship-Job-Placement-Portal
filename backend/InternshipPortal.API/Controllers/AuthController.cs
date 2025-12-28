using InternshipPortal.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternshipPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register/student")]
        public async Task<IActionResult> RegisterStudent([FromBody] RegisterStudentRequest request)
        {
            try
            {
                var token = await _authService.RegisterStudentAsync(
                    request.Email,
                    request.Password,
                    request.FirstName,
                    request.LastName
                );

                return Ok(new { success = true, message = "Student registered successfully", token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("register/employer")]
        public async Task<IActionResult> RegisterEmployer([FromBody] RegisterEmployerRequest request)
        {
            try
            {
                var message = await _authService.RegisterEmployerAsync(
                    request.Email,
                    request.Password,
                    request.CompanyName
                );

                return Ok(new { success = true, message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _authService.LoginAsync(request.Email, request.Password);
                return Ok(new { 
                    success = true, 
                    message = "Login successful", 
                    token = result.Token,
                    user = new {
                        userId = result.UserId,
                        email = result.Email,
                        userType = result.UserType,
                        isVerified = result.IsVerified
                    }
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
                var success = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);

                if (success)
                {
                    return Ok(new { success = true, message = "Password changed successfully" });
                }

                return BadRequest(new { success = false, message = "Current password is incorrect" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var success = await _authService.RequestPasswordResetAsync(request.Email);
                
                // Always return success for security (don't reveal if email exists)
                return Ok(new { 
                    success = true, 
                    message = "If an account with that email exists, a password reset link has been sent." 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("verify-reset-token")]
        public async Task<IActionResult> VerifyResetToken([FromBody] VerifyResetTokenRequest request)
        {
            try
            {
                var isValid = await _authService.VerifyResetTokenAsync(request.Token);
                
                return Ok(new { 
                    success = true, 
                    isValid 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var success = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
                
                if (success)
                {
                    return Ok(new { success = true, message = "Password reset successfully" });
                }

                return BadRequest(new { success = false, message = "Invalid or expired reset token" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public class RegisterStudentRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class RegisterEmployerRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyResetTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}

