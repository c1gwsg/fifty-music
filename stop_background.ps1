# Fifty Background Stopper
$FiftyDir = "c:\Users\bakaz\OneDrive\Desktop\new\Fifty"

# Kill node server on port 5173
$portConns = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
foreach ($conn in $portConns) {
    try {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Output "Stopped Node server PID $($conn.OwningProcess)"
    } catch {}
}

# Kill cloudflared
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Output "Stopped cloudflared PID $($_.Id)"
    } catch {}
}

Write-Output "Fifty services stopped."
