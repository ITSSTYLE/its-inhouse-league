import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireEnv } from "@/lib/env";
import { upsertPlayerForDiscordUser } from "@/lib/players";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
const requestUrl = new URL(request.url);
const code = requestUrl.searchParams.get("code");

const redirectUrl = new URL("/", request.url);

if (!code) {
redirectUrl.searchParams.set("auth_error", "missing_code");
return NextResponse.redirect(redirectUrl);
}

let response = NextResponse.redirect(redirectUrl);

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
      response = NextResponse.redirect(redirectUrl);

      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    }
  }
}
```

);

const { data, error } = await supabase.auth.exchangeCodeForSession(code);

if (error || !data.user) {
redirectUrl.searchParams.set(
"auth_error",
error?.message ?? "session_exchange_failed"
);

```
response = NextResponse.redirect(redirectUrl);

return response;
```

}

try {
await upsertPlayerForDiscordUser(data.user);
} catch (error) {
redirectUrl.searchParams.set(
"auth_error",
error instanceof Error ? error.message : "player_sync_failed"
);

```
response = NextResponse.redirect(redirectUrl);
```

}

return response;
}
