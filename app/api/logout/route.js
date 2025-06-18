// app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/signin', request.url));
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), 
  });
  return response;
}
