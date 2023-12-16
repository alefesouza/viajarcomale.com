import { NextResponse } from 'next/server';

export default function middleware(req) {
   const headers = new Headers(req.headers);
   const origin = headers.get('x-forwarded-host');
   const pathname = req.nextUrl.pathname;

   const searchParams = req.nextUrl.searchParams;
   
   if (pathname.endsWith('/webstories') && searchParams.get('fixer') !== 'true') {
      return NextResponse.redirect(new URL('/webstories' + pathname.replace('/webstories', ''), origin ? `https://${origin.replace('www.', '')}` : process.env.NEXT_PUBLIC_SITE_URL));
   }

   if (origin && origin.includes('www.viajarcomale.com')) {
      return NextResponse.redirect(new URL(pathname, `https://${origin.replace('www.', '')}`));
   }

   headers.set('x-pathname', pathname);

   return NextResponse.next({
      request: {
         headers
      }
   });
}
