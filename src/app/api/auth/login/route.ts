import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl, requireEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
const redirectTo = `${getSiteUrl()}/auth/callback`;

let response = NextResponse.next();

const supabase = createServerClient<Database>(
requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
{
cookies: {
getAll() {
return request.cookies.getAll();
},
setAll(cookiesToSet) {
cookiesToSet.forEach(({ name, value }) => {
request.cookies.set(name, value);
});

```
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    }
  }
}
```

);

const { data, error } = await supabase.auth.signInWithOAuth({
provider: "discord",
options: {
redirectTo,
scopes: "identify email"
}
});

if (error || !data.url) {
return NextResponse.json(
{ error: error?.message ?? "Unable to start Discord login." },
{ status: 500 }
);
}

const redirectResponse = NextResponse.redirect(data.url);

response.cookies.getAll().forEach((cookie) => {
redirectResponse.cookies.set(cookie);
});

return redirectResponse;
}
