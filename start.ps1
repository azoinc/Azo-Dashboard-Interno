# start.ps1 — Sobe o backend FastAPI e o frontend Vite juntos
# Uso: .\start.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root "backend"

Write-Host "==> Iniciando backend FastAPI (porta 8000)..." -ForegroundColor Cyan
$backendJob = Start-Process -FilePath "powershell" `
    -ArgumentList "-NoExit", "-Command", "cd '$backend'; .\.venv\Scripts\uvicorn.exe main:app --reload --port 8000" `
    -PassThru

Start-Sleep -Seconds 2

Write-Host "==> Iniciando frontend Vite (porta 5173)..." -ForegroundColor Green
$frontendJob = Start-Process -FilePath "powershell" `
    -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run dev" `
    -PassThru

Write-Host ""
Write-Host "Serviços iniciados:" -ForegroundColor Yellow
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para encerrar ambos..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
