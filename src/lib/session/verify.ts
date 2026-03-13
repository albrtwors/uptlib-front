export const verifySession = async () => {
    try {
        const sessionResponse = await fetch('/api/auth/verify-session', { method: 'GET', credentials: 'include' })
        if (sessionResponse.status == 401) return false
        if (sessionResponse.status == 200) return true

        throw new Error('error')
    } catch (error) {
        console.error('Error verifying session:', error);
        return false
    }

}