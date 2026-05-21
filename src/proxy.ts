import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { api } from './consts/api';



const PROTECTED_ROUTES = [
    {
        route: '/books/manage',
        roles: ['ADMIN', 'LIBRARIAN']
    },
    {
        route: '/physical-books/operations',
        roles: ['ADMIN', 'LIBRARIAN']
    },
    {
        route: '/physical-books/loans',
        roles: ['ADMIN', 'LIBRARIAN']
    }
    ,
    {
        route: '/physical-books/manage',
        roles: ['ADMIN', 'LIBRARIAN']
    }
    ,
    {
        route: '/inventory',
        roles: ['ADMIN', 'LIBRARIAN']
    }
    ,
    {
        route: '/inventory/operations',
        roles: ['ADMIN', 'LIBRARIAN']
    }
    ,
    {
        route: '/inventory/loans',
        roles: ['ADMIN', 'LIBRARIAN']
    }
    ,
    {
        route: '/admin/logs',
        roles: ['ADMIN']
    }
    ,
    {
        route: '/admin/users',
        roles: ['ADMIN']
    }
    ,
    {
        route: '/admin/database',
        roles: ['ADMIN']
    }


]
const admin_routes = [
    '/books/manage',
    '/physical-books/operations',
    '/physical-books/manage',
    '/physical-books/loans',
    '/inventory/operations',
    '/inventory',
    '/inventory/loans',
    '/admin/logs',
    '/admin/users',
    '/admin/database'
]



export async function proxy(request: NextRequest) {
    const tokenObj = request.cookies.get('jwt');
    const token = tokenObj?.value;
    const pathname = request.nextUrl.pathname;

    // Configurar las cabeceras para el fetch
    const headers = new Headers();
    if (token) {
        // Formato: jwt=tu_codigo_jwt_aqui
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

    if (sessionProxy(request, token, pathname)) return sessionProxy(request, token, pathname)


    return NextResponse.next()
}


const sessionProxy = (request: NextRequest, token: any, pathname: string) => {
    if (!token && pathname != '/signin' && pathname != '/signup' && pathname != '/welcome') {
        return NextResponse.redirect(new URL('/signin', request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Excluir archivos estáticos:
         * - _next/static (archivos CSS y JS)
         * - _next/image (optimización de imágenes)
         * - favicon.ico, etc.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}