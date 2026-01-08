$body = @{
    username = "admin"
    password = "Admin@2025!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -ContentType "application/json" -Body $body

Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 5
