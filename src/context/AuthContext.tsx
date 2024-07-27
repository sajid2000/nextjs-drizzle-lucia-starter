"use client";

import { Session, User } from "lucia";
import { createContext, useContext } from "react";

type Context = {
  session: Session | null;
  user: User | null;
};

const Context = createContext<Context>({
  session: null,
  user: null,
});

export const useAuth = () => useContext(Context);

const AuthContext: React.FC<React.PropsWithChildren<{ session: Session; user: User }>> = ({ children, session, user }) => {
  return <Context.Provider value={{ session, user }}>{children}</Context.Provider>;
};

export default AuthContext;
