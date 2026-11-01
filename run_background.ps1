# Fifty Standalone Background Launcher
$FiftyDir = "c:\Users\bakaz\OneDrive\Desktop\new\Fifty"
Set-Location $FiftyDir

# Kill any existing node server on port 5173
$portConns = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
foreach ($conn in $portConns) {
    try {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    } catch {}
}

# Kill any existing cloudflared
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue } catch {}
}

Start-Sleep -Seconds 1

# Start node server.js completely detached via WMI
$nodeCmd = "cmd.exe /c cd /d `"$FiftyDir`" && node server.js > server.log 2>&1"
$wmi = Invoke-WmiMethod -Class Win32_Process -Name Create -ArgumentList $nodeCmd, $FiftyDir
Write-Output "Started Node server (WMI Process: $($wmi.ProcessId))"

# Wait for port 5173 to be ready
$ready = $false
for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep -Milliseconds 500
    if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) {
        $ready = $true
        break
    }
}
Write-Output "Port 5173 listening: $ready"

# Remove old tunnel log
$tunnelLog = Join-Path $FiftyDir "tunnel.log"
if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }

# Start cloudflared detached via WMI
$cfExe = Join-Path $FiftyDir "cloudflared.exe"
$cfCmd = "cmd.exe /c `"$cfExe`" tunnel --url http://localhost:5173 > `"$tunnelLog`" 2>&1"
$cfWmi = Invoke-WmiMethod -Class Win32_Process -Name Create -ArgumentList $cfCmd, $FiftyDir
Write-Output "Started Cloudflare Tunnel (WMI Process: $($cfWmi.ProcessId))"

# Wait for tunnel URL in log
$tunnelUrl = ""
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $tunnelLog) {
        $logContent = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
        if ($logContent -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
            $tunnelUrl = $matches[0]
            break
        }
    }
}

if ($tunnelUrl) {
    Write-Output "TUNNEL_URL: $tunnelUrl"
    Set-Content -Path (Join-Path $FiftyDir "tunnel_url.txt") -Value $tunnelUrl
    Set-Content -Path "C:\Users\bakaz\OneDrive\Desktop\Fifty_URL.txt" -Value "Fifty Music App URL:`n$tunnelUrl`n`nLocal Wi-Fi URL:`nhttp://192.168.18.182:5173"
} else {
    Write-Output "Warning: Tunnel URL not captured in 20s, check tunnel.log"
}
