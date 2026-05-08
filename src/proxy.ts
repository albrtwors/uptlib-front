import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const token = request.cookies.get('jwt')
    const pathname = request.nextUrl.pathname;

    if (sessionProxy(request, token, pathname)) return sessionProxy(request, token, pathname)


    return NextResponse.next()
}


const sessionProxy = (request: NextRequest, token: any, pathname: string) => {
    if (!token && pathname != '/signin' && pathname != '/signup') {
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