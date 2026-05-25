# setup-env.ps1
# Gera os arquivos .env.local (raiz) e backend/.env com as credenciais corretas.
# Execute uma vez: .\setup-env.ps1
# Ambos os arquivos estao no .gitignore e NAO serao commitados.

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

# ─── .env.local na raiz (lido pelo Vite — frontend) ──────────────────────────
$envLocal = @"
# Gerado por setup-env.ps1 — NAO commitar (esta no .gitignore)

# Firebase (prefixo VITE_ para o Vite expor ao browser)
VITE_FIREBASE_API_KEY=AIzaSyAVx7QdGjAV-UQimsTvFxsRaLYOgeO50U8
VITE_FIREBASE_AUTH_DOMAIN=azo-finc-mkt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=azo-finc-mkt
VITE_FIREBASE_STORAGE_BUCKET=azo-finc-mkt.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=345243746191
VITE_FIREBASE_APP_ID=1:345243746191:web:86e4589025acf5b6c615fa
VITE_FIREBASE_DATABASE_ID=fincmktazo

# Sienge (apenas para referencia — o backend usa SIENGE_* abaixo)
VITE_SIENGE_SUBDOMAIN=azoinc
VITE_SIENGE_API_USER=azoinc-dashboardazo
VITE_SIENGE_API_PASSWORD=U3nCvRwzbjGDl65sFHSrLRy31sJOrVHi
VITE_SIENGE_ENABLED=true
"@

$envLocalPath = Join-Path $root ".env.local"
Set-Content -Path $envLocalPath -Value $envLocal -Encoding UTF8
Write-Host "[OK] Criado: .env.local (raiz)" -ForegroundColor Green

# ─── backend/.env (lido pelo FastAPI/Python) ──────────────────────────────────
$backendEnv = @"
# Gerado por setup-env.ps1 — NAO commitar (esta no .gitignore)

# PostgreSQL — extraido de SUPABASE_DB_URL
SP_HOST=aws-1-sa-east-1.pooler.supabase.com
SP_USER=postgres.gmvmdryoisurvhtdrppb
SP_PS=Azo@2025#Inc
SP_PORT=6543
SP_DB=postgres

# Sienge ERP API
SIENGE_SUBDOMAIN=azoinc
SIENGE_USERNAME=azoinc-dashboardazo
SIENGE_PASSWORD=U3nCvRwzbjGDl65sFHSrLRy31sJOrVHi

# Firebase Admin SDK
FIREBASE_PROJECT_ID=azo-finc-mkt
FIREBASE_DATABASE_ID=fincmktazo
# FIREBASE_CLIENT_EMAIL=  <- preencher com service account se necessario
# FIREBASE_PRIVATE_KEY=   <- preencher com service account se necessario

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Cache TTL em segundos
CACHE_TTL_SECONDS=300
"@

$backendDir = Join-Path $root "backend"
$backendEnvPath = Join-Path $backendDir ".env"
Set-Content -Path $backendEnvPath -Value $backendEnv -Encoding UTF8
Write-Host "[OK] Criado: backend/.env" -ForegroundColor Green

Write-Host ""
Write-Host "Pronto! Agora rode:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor Cyan
Write-Host "  python -m venv .venv" -ForegroundColor Cyan
Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor Cyan
Write-Host "  pip install -r requirements.txt" -ForegroundColor Cyan
Write-Host "  cd .." -ForegroundColor Cyan
Write-Host "  .\start.ps1" -ForegroundColor Cyan
