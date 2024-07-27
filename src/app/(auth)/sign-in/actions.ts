"use server";

import { redirect } from "next/navigation";

import { rateLimitByKey } from "@/lib/rate-limiter";
import { unauthenticatedAction } from "@/lib/safe-action";
import { setSession } from "@/lib/session";
import { login } from "@/services/authService";

import { LoginSchema } from "./validators";

export const signInAction = unauthenticatedAction
  .createServerAction()
  .input(LoginSchema)
  .handler(async ({ input }) => {
    await rateLimitByKey({ key: input.email, limit: 3, window: 10000 });

    const user = await login(input);

    if ("id" in user) {
      await setSession(user.id);
    }

    redirect("/");
  });
