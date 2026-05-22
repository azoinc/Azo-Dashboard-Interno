// Script temporário para testar conexões — execute com: node test-connections.mjs
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import pg from 'pg';

// Carrega .env.local manualmente
function loadEnv() {
  try {
    const content = readFileSync('.env.local', 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
    console.log('✅ .env.local carregado\n');
  } catch {
    console.error('❌ .env.local não encontrado — crie a partir do .env.example\n');
    process.exit(1);
  }
}

// ── Teste 1: Supabase PostgreSQL ──────────────────────────────────────────────
async function testSupabase() {
  console.log('━━━ Supabase (PostgreSQL direto) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.log('❌ SUPABASE_DB_URL não definida\n');
    return false;
  }
  console.log(`   URL: ${url.replace(/:([^@]+)@/, ':***@')}`);
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1 });
  try {
    const res = await pool.query('SELECT NOW() AS agora, current_database() AS banco');
    console.log(`✅ Conectado!`);
    console.log(`   Banco: ${res.rows[0].banco}`);
    console.log(`   Hora DB: ${res.rows[0].agora}`);

    // Verifica tabelas relevantes
    const tabelas = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('leads','lead_milestones')
      ORDER BY table_name
    `);
    if (tabelas.rows.length === 0) {
      console.log('⚠️  Tabelas leads/lead_milestones não encontradas no schema public');
    } else {
      for (const t of tabelas.rows) {
        const count = await pool.query(`SELECT COUNT(*) FROM ${t.table_name}`);
        console.log(`   Tabela "${t.table_name}": ${count.rows[0].count} registros`);
      }
    }

    // Verifica views relevantes
    const views = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name IN ('view_lead_snapshot_mensal','view_lead_snapshot_max_funil','view_funil_maximo_com_total')
      ORDER BY table_name
    `);
    for (const v of views.rows) {
      console.log(`   View "${v.table_name}": ✅ existe`);
    }
    console.log();
    return true;
  } catch (err) {
    console.log(`❌ Falha: ${err.message}\n`);
    return false;
  } finally {
    await pool.end();
  }
}

// ── Teste 2: Firebase Client SDK (só valida se as vars estão definidas) ───────
async function testFirebaseClient() {
  console.log('━━━ Firebase Client SDK (NEXT_PUBLIC_*) ━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];
  let allSet = true;
  for (const key of required) {
    const val = process.env[key];
    if (!val || val.includes('your-')) {
      console.log(`❌ ${key} = não configurada`);
      allSet = false;
    } else {
      console.log(`✅ ${key} = ${val.slice(0, 20)}...`);
    }
  }
  if (allSet) {
    console.log('✅ Variáveis do Firebase Client SDK estão preenchidas');
  } else {
    console.log('⚠️  Preencha as variáveis NEXT_PUBLIC_FIREBASE_* no .env.local');
  }
  console.log();
  return allSet;
}

// ── Teste 3: Firebase Admin SDK ───────────────────────────────────────────────
async function testFirebaseAdmin() {
  console.log('━━━ Firebase Admin SDK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const projectId    = process.env.FIREBASE_PROJECT_ID;
  const clientEmail  = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey   = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || projectId.includes('your-')) {
    console.log('⚠️  FIREBASE_PROJECT_ID não configurada — Admin SDK desabilitado (não obrigatório)');
    console.log();
    return null;
  }
  if (!clientEmail || clientEmail.includes('xxxxx') || !privateKey || privateKey.includes('YOUR_KEY')) {
    console.log(`⚠️  FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY não configuradas`);
    console.log('   → Admin SDK não utilizado (todos os dados estão no Supabase)\n');
    return null;
  }
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }) });
    const db = getFirestore(app);
    await db.listCollections();
    console.log(`✅ Firebase Admin conectado! Projeto: ${projectId}\n`);
    return true;
  } catch (err) {
    console.log(`❌ Falha no Admin SDK: ${err.message}\n`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
loadEnv();
console.log('🔍 Testando conexões...\n');

const [supabase, firebaseClient, firebaseAdmin] = await Promise.all([
  testSupabase(),
  testFirebaseClient(),
  testFirebaseAdmin(),
]);

console.log('━━━ Resumo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Supabase PostgreSQL:  ${supabase    ? '✅ OK' : '❌ FALHOU'}`);
console.log(`Firebase Client SDK:  ${firebaseClient ? '✅ OK' : '⚠️  variáveis faltando'}`);
console.log(`Firebase Admin SDK:   ${firebaseAdmin === null ? '➖ não configurado (OK)' : firebaseAdmin ? '✅ OK' : '❌ FALHOU'}`);
console.log();
