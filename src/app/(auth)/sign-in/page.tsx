"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import config from "@/config";
import { AUTH_URI } from "@/constants";
import { ValidationError } from "@/lib/errors";

import AuthCard from "../components/AuthCard";
import { signInAction } from "./actions";
import { LoginPayload, LoginSchema } from "./validators";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const form = useForm<LoginPayload>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "test@test.com",
      password: "test123",
    },
  });

  const { execute, isPending } = useServerAction(signInAction, {
    onError: ({ err }) => {
      if (err.name === "ValidationError") {
        const error = err as ValidationError;

        if (error.fieldErrors) {
          Object.keys(error.fieldErrors || {}).forEach((key) => {
            form.setError(key as any, { message: (error.fieldErrors as any)[key][0] });
          });
        }
      } else {
        toast.error(err.message);
      }
    },
    onSuccess: () => {
      toast.success("Login successfull!");
    },
  });

  return (
    <AuthCard
      headerLabel={
        <>
          <h2 className="text-3xl font-semibold">Login to {config.appName}</h2>
          <p className="text-sm text-muted-foreground">Choose your preferred sign in method</p>
        </>
      }
      bottomButtonLabel="Don't have an account?"
      bottomButtonHref={AUTH_URI.signUp}
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => execute(v))} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="john@example.com" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Button size="sm" variant="link" asChild className="h-auto p-0 font-normal text-blue-500">
                      <Link href={AUTH_URI.forgotPassword}>Forgot password?</Link>
                    </Button>
                  </div>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="******" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <LoadingButton type="submit" loading={isPending} className="w-full">
            Login
          </LoadingButton>
        </form>
      </Form>
    </AuthCard>
  );
};

export default LoginPage;
