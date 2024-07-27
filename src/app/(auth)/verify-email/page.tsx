"use client";

import { Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useServerAction } from "zsa-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AUTH_URI } from "@/constants";

import AuthCard from "../components/AuthCard";
import { verifyEmailAction } from "./actions";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { execute, isPending, error, isSuccess } = useServerAction(verifyEmailAction);

  useEffect(() => {
    if (!token) return;

    execute({ token });
  }, []);

  return (
    <AuthCard
      headerLabel={
        <>
          <h2 className="text-3xl font-semibold">Verifing email</h2>
          <p></p>
        </>
      }
      bottomButtonLabel="Back to login"
      bottomButtonHref={AUTH_URI.signIn}
    >
      <div className="flex w-full items-center justify-center">
        {isPending && <Loader className="animate-spin" />}

        {isSuccess && (
          <Alert variant={"success"}>
            <AlertTitle>Email Successfully Verified</AlertTitle>
            <AlertDescription>Your email has been successfully verified. You can now sign in to your account.</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant={"destructive"}>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </AuthCard>
  );
};

export default VerifyEmailPage;
