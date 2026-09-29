import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.cookies.has('authorId')) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set('authorId', `author_${crypto.randomUUID()}`, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
