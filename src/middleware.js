export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - login (custom login page)
         * - api/auth (next-auth api routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!login|api/auth|api/jenkins|api/manifest|_next/static|_next/image|favicon.ico|Logo.png).*)',
    ],
}
