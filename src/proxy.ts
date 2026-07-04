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

export async function proxy(request: NextRequest) {
    const tokenObj = request.cookies.get('jwt');
    const token = tokenObj?.value;
    const pathname = request.nextUrl.pathname;

    // 💡 Si la ruta es '/publicBooks' o cualquier subruta (ej: /publicBooks/2), saltamos directo al siguiente paso
    if (pathname === '/publicBooks' || pathname.startsWith('/publicBooks/')) {
        return NextResponse.next();
    }

    // Ejecuta primero el control de sesión básico
    const sessionResult = sessionProxy(request, token, pathname);
    if (sessionResult) return sessionResult;

    // Configurar las cabeceras para el fetch
    const headers = new Headers();
    if (token) {
        headers.append('Cookie', `jwt=${token}`);
    }

    // Hacemos la petición pasando las cabeceras
    const res = await fetch(`${api.base_url}/users/profile`, {
        method: 'GET',
        headers: headers
    });
    const { role } = await res.json()

    const isRouteViolated = PROTECTED_ROUTES.find(
        (route: any) => pathname === route.route && !route.roles.includes(role)
    );

    if (isRouteViolated) {
        return NextResponse.redirect(new URL('/404', request.url));
    }

    return NextResponse.next()
}

const sessionProxy = (request: NextRequest, token: any, pathname: string) => {
    // 💡 También protegemos aquí agregando la validación para que no redirija al login si entran sin token
    if (!token &&
        pathname !== '/signin' &&
        pathname !== '/signup' &&
        pathname !== '/welcome' &&
        pathname !== '/publicBooks' &&
        !pathname.startsWith('/publicBooks/')
    ) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Excluir archivos estáticos:
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}