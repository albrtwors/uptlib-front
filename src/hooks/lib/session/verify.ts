export const verifySession = async () => {
    try {
        const sessionResponse = await fetch('/api/auth/verify-session', { method: 'GET', credentials: 'include' })
        // Solo una respuesta 401 significa que la sesión no es válida.
        // Cualquier otro estado/error transitorio no debe expulsar al usuario.
        if (sessionResponse.status === 401) return false
        return true
    } catch (error) {
        console.error('Error verifying session:', error);
        return true
    }

}