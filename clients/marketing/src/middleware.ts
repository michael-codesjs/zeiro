import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser } from './utils/amplify-server-utils'

const NEXT_PUBLIC_DASHBOARD_CLIENT_URL = process.env.NEXT_PUBLIC_DASHBOARD_CLIENT_URL

export async function middleware(request: NextRequest) {

  console.log('running')
  // Skip middleware for static files and API routes
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Skip files
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const user = await authenticatedUser({ request, response } as any)

  console.log('user', user)

  const isAuthenticated = !!user

  // Marketing paths are only accessible to none authenticated users
  // if (isAuthenticated) {
  //   return NextResponse.redirect(new URL('/', NEXT_PUBLIC_DASHBOARD_CLIENT_URL))
  // }

  // Default behavior for unspecified paths
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
