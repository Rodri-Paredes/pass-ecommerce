import { createClient } from '@supabase/supabase-js';

// ==========================================
// 1. RELLENA ESTOS DATOS ANTES DE EJECUTAR
// ==========================================

const OLD_SUPABASE_URL = "https://jbdiidhseumjqdfxyzop.supabase.co";
// Ve a tu proyecto ANTIGUO Pro -> Project Settings -> API -> Copia el "service_role" secret
const OLD_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZGlpZGhzZXVtanFkZnh5em9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ0ODM0NCwiZXhwIjoyMDY4MDI0MzQ0fQ.JMDXuMDvI1f5Get4Miqv8OHopXeBO57w9EEfSreAMFs"; 

const NEW_SUPABASE_URL = "https://nvkoustxdmrxhdrcozqz.supabase.co";
// Ve a tu proyecto NUEVO Free -> Project Settings -> API -> Copia el "service_role" secret
const NEW_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52a291c3R4ZG1yeGhkcmNvenF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUyMzEwNywiZXhwIjoyMDkxMDk5MTA3fQ.NGtbVY-ab2ennJ-7Z5M0Jc7fEj3F_aHt-KUa76VCpiQ";

// ==========================================


const oldClient = createClient(OLD_SUPABASE_URL, OLD_SERVICE_KEY);
const newClient = createClient(NEW_SUPABASE_URL, NEW_SERVICE_KEY);

async function migrateImages() {
  console.log("🚀 Iniciando migración de Storage (Archivos e Imágenes)...");

  // 1. Listar todos los buckets del proyecto antiguo
  const { data: buckets, error: bucketsErr } = await oldClient.storage.listBuckets();
  
  if (bucketsErr) {
    console.error("❌ Error obteniendo los buckets:", bucketsErr.message);
    return;
  }

  console.log(`📦 Se encontraron ${buckets.length} buckets. Preparando copia...`);

  for (const bucket of buckets) {
    console.log(`\n📂 Procesando bucket: [${bucket.name}]...`);
    
    // 2. Crear el bucket en el proyecto nuevo (si no existe)
    const { error: createErr } = await newClient.storage.createBucket(bucket.name, { 
      public: bucket.public 
    });
    
    if (createErr && createErr.message !== 'The resource already exists' && !createErr.message.includes('already exists')) {
       console.log(`⚠️  Aviso creando bucket: ${createErr.message}`);
    }

    // 3. Procesar todas las carpetas y archivos de ese bucket
    await processFolder(bucket.name, '');
  }
  
  console.log("\n✅ ¡MIGRACIÓN DE IMÁGENES COMPLETADA EXITOSAMENTE! 🎉");
}

// Función recursiva para copiar carpetas y archivos
async function processFolder(bucketName, path) {
  let allItems = [];
  let currentOffset = 0;
  const LIMIT = 100;
  let hasMore = true;

  // Hacemos paginación porque Supabase devuelve por defecto máximo 100 elementos
  while (hasMore) {
    const { data: items, error } = await oldClient.storage.from(bucketName).list(path, {
      limit: LIMIT,
      offset: currentOffset
    });
    
    if (error) {
      console.error(`❌ Error leyendo carpeta ${path}:`, error.message);
      return;
    }

    if (items && items.length > 0) {
      allItems.push(...items);
      currentOffset += LIMIT;
    } else {
      hasMore = false;
    }
  }

  for (const item of allItems) {
    const itemPath = path ? `${path}/${item.name}` : item.name;

    // Ignorar archivo oculto de Supabase para carpetas vacías
    if (item.name === '.emptyFolderPlaceholder') continue;

    // Si no tiene "id", significa que es una sub-carpeta, la escaneamos
    if (!item.id) { 
      await processFolder(bucketName, itemPath);
    } 
    // Si tiene "id", es un archivo (imagen), la descargamos y subimos
    else {
      // Validar si la imagen ya existe en destino para no procesarla de nuevo y ahorrar tiempo
      const { data: checkData } = await newClient.storage.from(bucketName).list(path, {
        limit: 1,
        search: item.name
      });
      
      const alreadyExists = checkData && checkData.filter(d => d.name === item.name).length > 0;
      
      if (alreadyExists) {
        console.log(`  ⏳ Omitiendo (ya existe): ${itemPath}`);
        continue;
      }

      console.log(`  -> Copiando imagen nueva: ${itemPath}`);
      
      // A) Descargar
      const { data: fileData, error: downErr } = await oldClient.storage.from(bucketName).download(itemPath);
      if (downErr) {
         console.error(`     ❌ Error descargando ${itemPath}:`, downErr.message);
         continue;
      }
      
      // B) Subir al nuevo proyecto
      const { error: upErr } = await newClient.storage.from(bucketName).upload(itemPath, fileData, {
        upsert: true,
        contentType: item.metadata?.mimetype
      });
      
      if (upErr) {
         console.error(`     ❌ Error subiendo ${itemPath}:`, upErr.message);
      } else {
         console.log(`     ✅ OK`);
      }
    }
  }
}

migrateImages().catch(err => console.error("Error crítico:", err));