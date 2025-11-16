# Quick Firebase Monitoring Script
# Run this to quickly check your application status

Write-Host "🔍 Firebase Application Monitoring" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check live site status
Write-Host "📡 Checking Live Site..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://studio-7943908738-8bbf8.web.app" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site is UP and running (Status: $($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Site is DOWN or unreachable" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check Firebase CLI version
Write-Host "🔧 Firebase CLI Version..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>&1
Write-Host "Version: $firebaseVersion" -ForegroundColor White

Write-Host ""

# Open monitoring dashboards
Write-Host "🌐 Opening Monitoring Dashboards..." -ForegroundColor Yellow
Write-Host ""

Write-Host "[1] Main Console"
Write-Host "[2] Analytics"
Write-Host "[3] Performance"
Write-Host "[4] Hosting"
Write-Host "[5] Firestore Database"
Write-Host "[6] Authentication"
Write-Host "[7] All Dashboards"
Write-Host "[0] Skip"
Write-Host ""

$choice = Read-Host "Enter choice (0-7)"

switch ($choice) {
    "1" {
        Write-Host "Opening Firebase Console..." -ForegroundColor Green
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/overview"
    }
    "2" {
        Write-Host "Opening Analytics Dashboard..." -ForegroundColor Green
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/analytics"
    }
    "3" {
        Write-Host "Opening Performance Dashboard..." -ForegroundColor Green
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/performance"
    }
    "4" {
        Write-Host "Opening Hosting Dashboard..." -ForegroundColor Green
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/hosting"
    }
    "5" {
        Write-Host "Opening Firestore Database..." -ForegroundColor Green
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/firestore"
    }
    "6" {
        Write-Host "Opening Authentication..." -ForegroundColor Green
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/authentication"
    }
    "7" {
        Write-Host "Opening All Dashboards..." -ForegroundColor Green
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/overview"
        Start-Sleep -Seconds 1
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/analytics"
        Start-Sleep -Seconds 1
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/performance"
        Start-Sleep -Seconds 1
        Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/hosting"
    }
    "0" {
        Write-Host "Skipping dashboard opening" -ForegroundColor Gray
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Monitoring check complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For detailed monitoring guide, see: MONITORING_GUIDE.md" -ForegroundColor Cyan
Write-Host "🌐 Live Site: https://studio-7943908738-8bbf8.web.app" -ForegroundColor Cyan
Write-Host ""
