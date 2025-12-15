#!/usr/bin/env pwsh

# CollageJS Core - Post-build script
# This script handles post-build actions after TypeScript compilation

Write-Host "Running post-build actions..." -ForegroundColor Green

# Ensure the dist directory exists
if (-not (Test-Path "dist")) {
    Write-Error "dist directory not found. Make sure TypeScript compilation completed successfully."
    exit 1
}

# Copy logo files to dist directory
Write-Host "Copying logo files..." -ForegroundColor Yellow
$sourcePath = "src/logos"
$destPath = "dist/logos"

if (Test-Path $sourcePath) {
    # Create destination directory if it doesn't exist
    if (-not (Test-Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    }
    
    # Copy all files from src/logos to dist/logos
    Copy-Item -Path "$sourcePath/*" -Destination $destPath -Recurse -Force
    
    $fileCount = (Get-ChildItem $destPath -File).Count
    Write-Host "✓ Copied $fileCount logo file(s) to dist/logos" -ForegroundColor Green
} else {
    Write-Warning "Source directory '$sourcePath' not found. Skipping logo copy."
}

# Add more post-build actions here as needed
# Example:
# Write-Host "Generating documentation..." -ForegroundColor Yellow
# # ... documentation generation code ...

Write-Host "Post-build actions completed successfully!" -ForegroundColor Green