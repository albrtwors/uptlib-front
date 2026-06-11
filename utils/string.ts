/**
 * Sanitiza un texto y genera un nombre de archivo seguro con un timestamp único.
 */
export function generateSafeFileName(title: string, originalFileName: string): string {
    const sanitized = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remueve acentos
        .replace(/[^a-z0-9]/g, '_')     // Reemplaza caracteres especiales por guiones bajos
        .replace(/_+/g, '_');           // Evita múltiples guiones bajos seguidos

    const fileExt = originalFileName.split('.').pop() || 'pdf';

    // Retorna el nombre sanitizado seguido de un timestamp único y su extensión
    return `${sanitized}-${Date.now()}.${fileExt}`;
}