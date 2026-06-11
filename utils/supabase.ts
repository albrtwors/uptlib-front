import { createClient } from "@supabase/supabase-js";

// Next.js detecta process.env automáticamente sin usar la librería 'dotenv'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validación de seguridad en desarrollo
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de entorno de Supabase en .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Elimina un archivo del bucket de almacenamiento de Supabase.
 */
export async function deleteFile(supabasePath: string, bucket: string): Promise<void> {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([supabasePath]);

    if (error) {
        throw new Error(`Error al eliminar archivo de Supabase: ${error.message}`);
    }

    console.log(`Archivo eliminado con éxito de Supabase: ${supabasePath}`);
}

/**
 * Sube un archivo a un bucket de Supabase.
 * Nota: Si ejecutas esto en el Frontend, pasa el objeto 'File' nativo directo y elimina '.buffer'.
 */
export async function uploadFile(
    file: any,
    bucket: string,
    newName: string,
    type: string = 'application/pdf'
): Promise<string | null> {

    // Si estás en Backend (Node), usas file.buffer. Si estás en Frontend, usas solo file.
    const fileData = file.buffer ? file.buffer : file;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(newName, fileData, {
            cacheControl: '3600',
            upsert: true,
            contentType: type,
        });

    if (error) {
        console.error('Error uploading:', error);
        return null;
    }

    console.log('Upload successful:', data);

    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(newName);

    return publicUrlData.publicUrl;
}