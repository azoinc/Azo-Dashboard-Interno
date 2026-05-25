# Azo Dashboard — Backend Python/FastAPI

Backend que substitui o `server.ts` (Express) e move toda a lógica de cálculo do browser para o servidor.

## Estrutura

```
backend/
├── main.py                          # Entry point FastAPI
├── requirements.txt
├── .env.example
├── config/
│   └── settings.py                  # Pydantic-settings (lê .env)
├── db/
│   └── connection.py                # Pool PostgreSQL via psycopg2
├── models/
│   └── schemas.py                   # Schemas Pydantic + constantes de tipos
├── services/
│   ├── status_normalizer.py         # Porta de normalizeStatus() do TS
│   ├── interno_dashboard_service.py # Porta completa de useInternoDashboard.ts
│   └── sienge_service.py            # Porta de siengeService.ts
└── routers/
    ├── health.py                    # GET  /api/health
    ├── query.py                     # POST /api/query  (compatível com src/lib/supabase.ts)
    ├── interno_dashboard.py         # POST /api/interno-dashboard
    └── sienge.py                    # GET  /api/sienge/summary  (e sub-rotas)
```

## Endpoints

| Método | Rota | Substitui |
|--------|------|-----------|
| `GET`  | `/api/health` | `GET /api/health` do server.ts |
| `POST` | `/api/query` | `POST /api/query` do server.ts — **o frontend não precisa mudar nada** |
| `POST` | `/api/interno-dashboard` | `useInternoDashboard.ts` (toda a lógica de leads/funil/snapshot) |
| `GET`  | `/api/sienge/summary?startDate=&endDate=` | `useSiengeIntegration.ts` |
| `GET`  | `/api/sienge/enterprises` | `siengeService.getEmpreendimentos()` |
| `GET`  | `/api/sienge/vendas?startDate=&endDate=` | `siengeService.getVendas()` |
| `GET`  | `/api/sienge/custos?startDate=&endDate=` | `siengeService.getCustosMarketing()` |

## Como rodar

```powershell
cd backend

# 1. Criar ambiente virtual
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows PowerShell
# source .venv/bin/activate     # Linux/Mac

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Subir o servidor (lê .env.local da raiz automaticamente)
uvicorn main:app --reload --port 8000
```

A API ficará disponível em `http://localhost:8000`.  
Documentação interativa (Swagger): `http://localhost:8000/docs`

## Variáveis de ambiente

O backend lê automaticamente o `.env.local` da **raiz do projeto** — o mesmo arquivo que o Vite usa.  
Não é necessário criar um `.env` separado no backend.

As variáveis suportadas (aceita tanto o nome direto quanto o prefixo `VITE_`):

| Variável no `.env.local` | Usada para |
|---|---|
| `SP_HOST`, `SP_USER`, `SP_PS`, `SP_PORT` | Conexão PostgreSQL |
| `SIENGE_SUBDOMAIN` ou `VITE_SIENGE_SUBDOMAIN` | API Sienge |
| `SIENGE_USERNAME` ou `VITE_SIENGE_API_USER` | API Sienge |
| `SIENGE_PASSWORD` ou `VITE_SIENGE_API_PASSWORD` | API Sienge |
| `FIREBASE_PROJECT_ID` ou `VITE_FIREBASE_PROJECT_ID` | Firebase |

## Subir tudo junto (frontend + backend)

Na raiz do projeto:

```powershell
.\start.ps1
```

Isso abre dois terminais: Vite em `:5173` e FastAPI em `:8000`.  
O proxy do Vite (`vite.config.ts`) já redireciona todas as chamadas `/api/*` do frontend para o backend automaticamente.

## Integração com o Frontend

**Nenhum arquivo do frontend foi alterado.**

- `src/lib/supabase.ts` chama `POST /api/query` → proxy redireciona para FastAPI
- `useSiengeIntegration.ts` chama `GET /api/sienge/summary` → proxy redireciona para FastAPI  
- `useInternoDashboard.ts` pode ser atualizado para chamar `POST /api/interno-dashboard` (opcional — a lógica já está no backend)
