import { NextResponse } from 'next/server';

export default function middleware(req) {
   const headers = new Headers(req.headers);
   headers.set('x-pathname', req.nextUrl.pathname);

   return NextResponse.next({
      request: {
         headers
      }
   });
}
