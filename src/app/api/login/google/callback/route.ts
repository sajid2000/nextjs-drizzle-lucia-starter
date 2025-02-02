import { OAuth2RequestError } from "arctic";
import { cookies } from "next/headers";

import { DEFAULT_LOGIN_REDIRECT } from "@/constants";
import { googleAuth } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { getAccountByGoogleId } from "@/repositories/accounts";
import { createGoogleUser } from "@/services/userService";

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookies().get("google_code_verifier")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier);
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const googleUser: GoogleUser = await response.json();

    const existingAccount = await getAccountByGoogleId(googleUser.sub);

    if (existingAccount) {
      await setSession(existingAccount.userId);

      return new Response(null, {
        status: 302,
        headers: {
          Location: DEFAULT_LOGIN_REDIRECT,
        },
      });
    }

    const user = await createGoogleUser(googleUser);
    await setSession(user.id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: DEFAULT_LOGIN_REDIRECT,
      },
    });
  } catch (e) {
    console.error(e);
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}
