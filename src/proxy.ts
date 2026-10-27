import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { api } from './consts/api';

const PROTECTED_ROUTES = [
    { route: '/books/manage', roles: ['ADMIN', 'LIBRARIAN'] },
    { route: '/physical-books/operations', roles: ['ADMIN', 'LIBRARIAN'] },
    { route: '/physical-books/loans', roles: ['ADMIN', 'LIBRARIAN'] },
    { route: '/physical-books/manage', roles: ['ADMIN', 'LIBRARIAN'] },
    { route: '/inventory', roles: ['ADMIN', 'LIBRARIAN'] },
    { route: '/inventory/operations', roles: ['ADMIN', 'LIBRARIAN'] },
    { route: '/inventory/loans', roles: ['ADMIN', 'LIBRARIAN'] },
    { route: '/admin/logs', roles: ['ADMIN'] },
    { route: '/admin/users', roles: ['ADMIN'] },
    { route: '/admin/database', roles: ['ADMIN'] }
]

const PUBLIC_ROUTES = ['/signin', '/signup', '/welcome', '/verify-email', '/forgot-password', '/reset-password'];

const isPublicRoute = (pathname: string) =>
    PUBLIC_ROUTES.includes(pathname) ||
    pathname === '/publicBooks' ||
    pathname.startsWith('/publicBooks/');

const getProtectedRoute = (pathname: string) =>
    PROTECTED_ROUTES.find(
        ({ route }) => pathname === route || pathname.startsWith(`${route}/`)
    );

const getRoleFromToken = async (token: string): Promise<string | null> => {
    try {
        const res = await fetch(`${api.base_url}/users/profile`, {
            method: 'GET',
            headers: { Cookie: `jwt=${token}` },
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const profile = await res.json().catch(() => null);
        return typeof profile?.role === 'string' ? profile.role : null;
    } catch {
        return null;
    }
}

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('jwt')?.value;
    const pathname = request.nextUrl.pathname;

    // Las rutas públicas no dependen del backend: así el login no se cae si
    // /users/profile tarda o falla (por ejemplo en un cold start).
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    const protectedRoute = getProtectedRoute(pathname);

    // Solo consultamos el perfil cuando la ruta realmente requiere un rol.
    if (!protectedRoute) {
        return NextResponse.next();
    }

    const role = await getRoleFromToken(token);

    if (!role || !protectedRoute.roles.includes(role)) {
        return NextResponse.redirect(new URL('/error-404', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Excluir archivos estáticos:
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
