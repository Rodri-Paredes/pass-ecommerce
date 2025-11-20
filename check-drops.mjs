import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Verificando configuración de drops...\n');

async function checkDrops() {
  // Test 1: Verificar conexión
  console.log('1️⃣ Verificando conexión a Supabase...');
  const { data: testData, error: testError } = await supabase.from('drops').select('count');
  if (testError) {
    console.error('❌ Error de conexión:', testError.message);
    return;
  }
  console.log('✅ Conexión exitosa\n');

  // Test 2: Listar TODOS los drops sin filtros
  console.log('2️⃣ Listando TODOS los drops (sin filtros)...');
  const { data: allDrops, error: allError } = await supabase
    .from('drops')
    .select('*');
  
  if (allError) {
    console.error('❌ Error:', allError.message);
  } else {
    console.log(`✅ Total drops en la DB: ${allDrops?.length || 0}`);
    if (allDrops && allDrops.length > 0) {
      allDrops.forEach((drop, i) => {
        console.log(`\n   Drop ${i + 1}:`);
        console.log(`   - ID: ${drop.id}`);
        console.log(`   - Nombre: ${drop.name}`);
        console.log(`   - Status: ${drop.status}`);
        console.log(`   - Featured: ${drop.is_featured}`);
        console.log(`   - Launch date: ${drop.launch_date}`);
      });
    } else {
      console.log('   ⚠️ No hay drops en la base de datos');
    }
  }

  // Test 3: Buscar drops ACTIVOS
  console.log('\n3️⃣ Listando drops con status = ACTIVO...');
  const { data: activeDrops, error: activeError } = await supabase
    .from('drops')
    .select('*')
    .eq('status', 'ACTIVO');
  
  if (activeError) {
    console.error('❌ Error:', activeError.message);
  } else {
    console.log(`✅ Drops activos: ${activeDrops?.length || 0}`);
    if (activeDrops && activeDrops.length > 0) {
      activeDrops.forEach(drop => {
        console.log(`   - ${drop.name} (featured: ${drop.is_featured})`);
      });
    }
  }

  // Test 4: Query exacta que usa la app
  console.log('\n4️⃣ Ejecutando query exacta de la app...');
  const { data: appQuery, error: appError } = await supabase
    .from('drops')
    .select('*')
    .eq('status', 'ACTIVO')
    .order('is_featured', { ascending: false })
    .order('launch_date', { ascending: false })
    .limit(1);
  
  if (appError) {
    console.error('❌ Error:', appError.message);
  } else {
    console.log(`✅ Resultado: ${appQuery?.length || 0} drop(s)`);
    if (appQuery && appQuery.length > 0) {
      console.log(`   ✅ Drop encontrado: ${appQuery[0].name}`);
      console.log(`   - ID: ${appQuery[0].id}`);
    } else {
      console.log('   ⚠️ La query no devolvió resultados');
    }
  }

  // Test 5: Buscar el drop específico por ID
  console.log('\n5️⃣ Buscando drop específico bb639b27-da45-4d9d-ad8c-769e5fd0293f...');
  const { data: specificDrop, error: specificError } = await supabase
    .from('drops')
    .select('*')
    .eq('id', 'bb639b27-da45-4d9d-ad8c-769e5fd0293f')
    .single();
  
  if (specificError) {
    console.error('❌ Error:', specificError.message);
  } else if (specificDrop) {
    console.log('✅ Drop encontrado:');
    console.log(`   - Nombre: ${specificDrop.name}`);
    console.log(`   - Status: ${specificDrop.status}`);
    console.log(`   - Featured: ${specificDrop.is_featured}`);
    console.log(`   - Launch date: ${specificDrop.launch_date}`);
  }
}

checkDrops().then(() => {
  console.log('\n✅ Verificación completada');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Error fatal:', err);
  process.exit(1);
});
