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

# Copy CSS theme
Write-Host "Copying CSS theme..." -ForegroundColor Yellow
$cssSource = "src/theme"
$cssDest = "dist/theme"
if (Test-Path $cssSource) {
    # Create destination directory if it doesn't exist
    if (-not (Test-Path $cssDest)) {
        New-Item -ItemType Directory -Path $cssDest -Force | Out-Null
    }

    # Copy all files from src/theme to dist/theme
    Copy-Item -Path "$cssSource/*.css" -Destination $cssDest -Recurse -Force
    Copy-Item -Path "$cssSource/theme.d.ts" -Destination $cssDest -Force

    $cssFileCount = (Get-ChildItem $cssDest -File).Count
    Write-Host "✓ Copied $cssFileCount CSS file(s) to dist/theme" -ForegroundColor Green
} else {
    Write-Warning "Source directory '$cssSource' not found. Skipping CSS theme copy."
}

Write-Host "Post-build actions completed successfully!" -ForegroundColor Green
