import { cookies } from "next/headers";
import { cache } from "react";

import { lucia, validateRequest } from "@/lib/auth";
import { UserID } from "@/types";

import { AuthenticationError } from "./errors";

import "server-only";

export const getSession = cache(async () => {
  const session = await validateRequest();

  if (!session.session || !session.user) {
    return undefined;
  }

  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await validateRequest();

  if (!session.user) {
    return undefined;
  }

  return session.user;
});

export const assertAuthenticated = async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
};

export async function setSession(userId: UserID) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}
