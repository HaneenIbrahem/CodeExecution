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
           // Example: Save code to file and execute it
           string tempFilePath = Path.Combine(Path.GetTempPath(), "UserCode.js");
           System.IO.File.WriteAllText(tempFilePath, request.Code);

           // Run the code using Node.js
           ProcessStartInfo startInfo = new ProcessStartInfo
           {
               FileName = "node",
               Arguments = tempFilePath,
               RedirectStandardOutput = true,
               RedirectStandardError = true,
               UseShellExecute = false,
               CreateNoWindow = true
           };

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
   public string Code { get; set; }
}