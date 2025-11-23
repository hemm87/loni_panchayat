# Docker Build and Push Script for Loni Panchayat
# Run this after starting Docker Desktop

Write-Host "🐳 Building Docker Image..." -ForegroundColor Cyan

# Build the image with multiple tags
docker build -t loni-panchayat:latest `
             -t hemm87/loni-panchayat:latest `
             -t hemm87/loni-panchayat:v1.0.0 .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    Write-Host "`n🔐 Logging in to Docker Hub..." -ForegroundColor Cyan
    Write-Host "Please enter your Docker Hub credentials:" -ForegroundColor Yellow
    
    # Login to Docker Hub
    docker login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n📤 Pushing to Docker Hub..." -ForegroundColor Cyan
        
        # Push all tags
        docker push hemm87/loni-panchayat:latest
        docker push hemm87/loni-panchayat:v1.0.0
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Successfully pushed to Docker Hub!" -ForegroundColor Green
            Write-Host "`n📦 Your images are available at:" -ForegroundColor Cyan
            Write-Host "   - docker pull hemm87/loni-panchayat:latest" -ForegroundColor White
            Write-Host "   - docker pull hemm87/loni-panchayat:v1.0.0" -ForegroundColor White
            
            Write-Host "`n🚀 To run locally:" -ForegroundColor Cyan
            Write-Host "   docker run -p 3000:3000 --env-file .env.local loni-panchayat:latest" -ForegroundColor White
        } else {
            Write-Host "❌ Push failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Docker Hub login failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}
