# setup-vercel-env.ps1
# Adiciona as variáveis de ambiente ao projeto Vercel via CLI.
# Requer: npm i -g vercel && vercel login
# Uso: .\setup-vercel-env.ps1

$vars = @{
    # PostgreSQL (extraído de SUPABASE_DB_URL)
    "SP_HOST"             = "aws-1-sa-east-1.pooler.supabase.com"
    "SP_USER"             = "postgres.gmvmdryoisurvhtdrppb"
    "SP_PS"               = "Azo@2025#Inc"
    "SP_PORT"             = "6543"
    "SP_DB"               = "postgres"
    # Sienge
    "SIENGE_SUBDOMAIN"    = "azoinc"
    "SIENGE_USERNAME"     = "azoinc-dashboardazo"
    "SIENGE_PASSWORD"     = "U3nCvRwzbjGDl65sFHSrLRy31sJOrVHi"
    # Firebase (vars públicas — também precisam estar no build)
    "VITE_FIREBASE_API_KEY"              = "AIzaSyAVx7QdGjAV-UQimsTvFxsRaLYOgeO50U8"
    "VITE_FIREBASE_AUTH_DOMAIN"          = "azo-finc-mkt.firebaseapp.com"
    "VITE_FIREBASE_PROJECT_ID"           = "azo-finc-mkt"
    "VITE_FIREBASE_STORAGE_BUCKET"       = "azo-finc-mkt.firebasestorage.app"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"  = "345243746191"
    "VITE_FIREBASE_APP_ID"               = "1:345243746191:web:86e4589025acf5b6c615fa"
    "VITE_FIREBASE_DATABASE_ID"          = "fincmktazo"
    # Sienge flag para o frontend
    "VITE_SIENGE_SUBDOMAIN"              = "azoinc"
    "VITE_SIENGE_API_USER"               = "azoinc-dashboardazo"
    "VITE_SIENGE_API_PASSWORD"           = "U3nCvRwzbjGDl65sFHSrLRy31sJOrVHi"
    "VITE_SIENGE_ENABLED"                = "true"
}

foreach ($key in $vars.Keys) {
    $value = $vars[$key]
    Write-Host "Adicionando $key ..." -ForegroundColor Cyan
    # Adiciona para production, preview e development
    echo $value | vercel env add $key production --force 2>&1 | Out-Null
    echo $value | vercel env add $key preview    --force 2>&1 | Out-Null
}

Write-Host ""
Write-Host "Pronto! Faça o deploy com:" -ForegroundColor Green
Write-Host "  vercel --prod" -ForegroundColor Yellow
