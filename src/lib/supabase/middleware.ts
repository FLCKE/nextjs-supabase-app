
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Initialize a response object to update cookies
  // This response will be mutated by setAll in createServerClient
  let response = NextResponse.next({
    request,
  })

  // 2. Create a Supabase client configured for server-side usage in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => response.cookies.set(cookie))
        },
      },
    }
  )

  let user = null;
  let session = null;
  let authError = null;
  try {
    // console.log(supabase);
    // 3. Get the session (which also implicitly refreshes tokens if needed)
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Middleware: Error getting session:", error.message, error);
      authError = error;
    } else {
      session = data.session;
      user = data.session?.user || null;
      if (session) {
        console.log("Middleware: Session found, user:", user?.id);
      } else {
        console.log("Middleware: No active session found.");
      }
    }
  } catch (e: any) {
    console.error("Middleware: Exception in supabase.auth.getSession():", e.message, e);
    authError = e;
  }
  
  if (authError) {
      console.error("Middleware: Auth error detected, proceeding without authenticated user.");
  }


  const { pathname } = request.nextUrl;
  const publicPaths = ['/', '/sign-in', '/sign-up', '/staff-login', '/restaurants', '/auth/callback'];
  const authRoutes = ['/sign-in', '/sign-up', '/staff-login'];
  const dashboardRoutes = ['/dashboard', '/dashboard/pos'];

  if (user) {
    // User is authenticated, fetch profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, restaurant_id')
      .eq('id', user.id)
      .single();

    let homePath = '/'; // Default home path

    if (profile) {
      if (profile.role === 'staff') {
        homePath = '/staff-dashboard';
      } else if (profile.role === 'owner') {
        homePath = '/dashboard';
      } else if (profile.role === 'admin') {
        homePath = '/dashboard/admin';
      }
    }

    // If user is authenticated and trying to access an auth page, redirect to their homePath
    if (authRoutes.some(route => pathname.startsWith(route))) {
      const url = request.nextUrl.clone();
      url.pathname = homePath;
      return NextResponse.redirect(url);
    }
    
    // If user is authenticated and on home page, redirect to their home path
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = homePath;
      return NextResponse.redirect(url);
    }
    
    // If staff tries to access restricted dashboard areas, redirect to their dashboard
    if (profile?.role === 'staff' && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/pos')) {
        const url = request.nextUrl.clone();
        url.pathname = '/staff-dashboard';
        return NextResponse.redirect(url);
    }

} else {
  // User is NOT authenticated
  // If trying to access a dashboard route or other protected route, redirect to sign-in
  // BUT: Don't redirect if there's an auth code in the URL (magic link/callback flow)
  const hasAuthCode = request.nextUrl.searchParams.has('code');
  const hasAuthToken = request.nextUrl.hash.includes('access_token');
  
  if (dashboardRoutes.some(route => pathname.startsWith(route)) && !hasAuthCode && !hasAuthToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }
  // Allow access to other public paths
}

  return response; // Return the response object that may contain updated cookies
}
