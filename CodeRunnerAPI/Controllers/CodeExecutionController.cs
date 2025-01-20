using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

[Route("api/[controller]")]
[ApiController]
public class CodeExecutionController : ControllerBase
{
    [HttpPost("run")]
    public IActionResult RunCode([FromBody] CodeRequest request)
    {
        try
        {
            // Validate the input language
            if (string.IsNullOrWhiteSpace(request.Language) || string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new { error = "Language and Code fields are required." });
            }

            string tempFilePath;
            ProcessStartInfo startInfo;

            // Determine the execution environment based on the language
            if (request.Language.ToLower() == "javascript")
            {
                // Save JavaScript code to a temporary file
                tempFilePath = Path.Combine(Path.GetTempPath(), "UserCode.js");
                System.IO.File.WriteAllText(tempFilePath, request.Code);

                // Configure the process to execute JavaScript code using Node.js
                startInfo = new ProcessStartInfo
                {
                    FileName = "node",
                    Arguments = tempFilePath,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
            }
            else if (request.Language.ToLower() == "python")
            {
                // Save Python code to a temporary file
                tempFilePath = Path.Combine(Path.GetTempPath(), "UserCode.py");
                System.IO.File.WriteAllText(tempFilePath, request.Code);

                // Configure the process to execute Python code using Python interpreter
                startInfo = new ProcessStartInfo
                {
                    FileName = "python", // Ensure "python" is in the system PATH
                    Arguments = tempFilePath,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
            }
            else
            {
                return BadRequest(new { error = "Unsupported language. Please use 'javascript' or 'python'." });
            }

            // Execute the process and capture the output
            using (var process = Process.Start(startInfo))
            {
                string output = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();

                process.WaitForExit();

                if (!string.IsNullOrWhiteSpace(error))
                {
                    return BadRequest(new { error = error });
                }

                return Ok(new { output = output });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class CodeRequest
{
    public string Language { get; set; } 
    public string Code { get; set; }
}