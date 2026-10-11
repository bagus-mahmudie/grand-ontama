$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$outputDir = Join-Path $projectRoot '_site'
$distDir = Join-Path $projectRoot 'dist'
$zipPath = Join-Path $distDir 'grand-ontama-cpanel.zip'
$privateConfigSource = Join-Path $projectRoot 'grand-ontama-config.php'
$privateConfigOutput = Join-Path $distDir 'grand-ontama-config.php'

Push-Location $projectRoot
try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        throw 'Build Eleventy/Tailwind gagal.'
    }

    if (-not (Test-Path -LiteralPath (Join-Path $outputDir 'index.html'))) {
        throw 'Hasil build index.html tidak ditemukan.'
    }

    & npm.cmd run check
    if ($LASTEXITCODE -ne 0) {
        throw 'Pemeriksaan hasil build gagal.'
    }

    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    & tar.exe -a -c -f $zipPath -C $outputDir .
    if ($LASTEXITCODE -ne 0) {
        throw 'Pembuatan ZIP cPanel gagal.'
    }

    if (Test-Path -LiteralPath $privateConfigSource) {
        Copy-Item -LiteralPath $privateConfigSource -Destination $privateConfigOutput -Force
        Write-Host "Konfigurasi privat disiapkan terpisah: $privateConfigOutput"
    } else {
        Write-Warning 'grand-ontama-config.php belum tersedia. Formulir tidak akan aktif sebelum file privat dibuat.'
    }

    Write-Host "Paket cPanel selesai: $zipPath"
    Write-Host 'Ekstrak ISI ZIP langsung ke public_html.'
    Write-Host 'Unggah grand-ontama-config.php ke folder induk public_html.'
} finally {
    Pop-Location
}
