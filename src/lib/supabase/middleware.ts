
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
      // If there's an auth error, we might want to clear cookies to avoid endless loops
      // response.cookies.delete('sb-access-token'); // Example
      // response.cookies.delete('sb-refresh-token'); // Example
  }


  const { pathname } = request.nextUrl;
  const publicPaths = ['/', '/sign-in', '/sign-up', '/staff-login', '/restaurants'];
  const authRoutes = ['/sign-in', '/sign-up', '/staff-login'];
  const dashboardRoutes = ['/dashboard', '/dashboard/pos'];

  // --- Start: Fragment stripping and primary redirect logic ---
  // This needs to happen AFTER createServerClient has processed the cookies
  // and getSession() has run, potentially updating the session.
  // If the URL currently contains an access_token in the hash, it's a Supabase callback.
  // We need to strip the hash and redirect to a clean URL, propagating the updated cookies.
  if (request.nextUrl.hash && request.nextUrl.hash.includes('access_token')) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.hash = ''; // Remove the hash
    // Create a new response for the redirect, and ensure the updated cookies are included.
    const redirectResponse = NextResponse.redirect(cleanUrl.toString());
    // Copy all cookies from the `response` (which contains updated cookies from createServerClient)
    // to the `redirectResponse`.
    // The `response` object itself now holds the `set-cookie` headers
    // from createServerClient's `setAll` function. We need to copy these.
    response.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith('set-cookie')) {
            redirectResponse.headers.append(key, value);
        }
    });
    return redirectResponse;
  }
  // --- End: Fragment stripping and primary redirect logic ---


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
        homePath = '/dashboard/pos';
      } else if (profile.role === 'owner') {
        homePath = '/dashboard';
      } else if (profile.role === 'admin') {
        homePath = '/dashboard/admin'; // Assuming an admin dashboard exists
      }
    }

    // If user is authenticated and trying to access an auth page, redirect to their homePath
    if (authRoutes.some(route => pathname.startsWith(route))) {
      const url = request.nextUrl.clone();
      url.pathname = homePath;
      return NextResponse.redirect(url);
    }
    
    // If staff tries to access owner dashboard, redirect to POS dashboard
    if (profile?.role === 'staff' && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/pos')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/pos';
        return NextResponse.redirect(url);
    }

  } else {
    // User is NOT authenticated
    // If trying to access a dashboard route or other protected route, redirect to sign-in
    if (dashboardRoutes.some(route => pathname.startsWith(route))) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }
    // Allow access to other public paths
  }

  return response; // Return the response object that may contain updated cookies
}
