import { NextResponse } from 'next/server';

export default function middleware(req) {
   if (req.nextUrl.pathname === '/') {
      // Is there no easy way to get the current url on Next.js server side?????
      const headers = new Headers(req.headers);
      headers.set('x-host', req.nextUrl.host);

      return NextResponse.next({
         request: {
            headers
         }
      });
   }

   return NextResponse.next();
}
