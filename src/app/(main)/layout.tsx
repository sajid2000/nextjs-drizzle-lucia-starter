import { redirect } from "next/navigation";
import React from "react";

import Header from "@/components/Header";
import { AUTH_URI } from "@/constants";
import AuthContext from "@/context/AuthContext";
import { getCurrentUser, getSession } from "@/lib/session";

type Props = {
  children: React.ReactNode;
};

const MainLayout: React.FC<Props> = async ({ children }) => {
  const session = await getSession();

  if (!session) return redirect(AUTH_URI.signIn);

  return (
    <AuthContext session={session.session} user={session.user}>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        {children}
      </div>
    </AuthContext>
  );
};

export default MainLayout;
