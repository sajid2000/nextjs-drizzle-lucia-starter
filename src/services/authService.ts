import bcrypt from "bcryptjs";

import { LoginPayload } from "@/app/(auth)/sign-in/validators";
import { RegisterPayload } from "@/app/(auth)/sign-up/validators";
import { ApplicationError, NotFoundError, TokenExpiredError, ValidationError } from "@/lib/errors";
import { deletePasswordResetToken, deleteVerifyToken, getPasswordResetToken, getVerifyToken } from "@/repositories/tokens";
import { createMagicUser, createUser, getUserByEmail, updateUser, updateUserByEmail } from "@/repositories/users";

import { deleteMagicToken, getMagicLinkByToken, sendPasswordResetTokenEmail, sendVerifyEmail } from "./tokenService";

export async function login(payload: LoginPayload) {
  const { email, password } = payload;

  const user = await getUserByEmail(email);

  if (!user || !user.password) {
    throw new ValidationError({ email: ["Email does not exist!"] });
  }

  if (!user.emailVerified) {
    await sendVerifyEmail(email);

    return { success: true, message: "Confirmation email sent!" } as const;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new ApplicationError("Invalid credentials!");
  }

  return user;
}

export async function loginWithMagicLink(token: string) {
  const magicLinkInfo = await getMagicLinkByToken(token);

  if (!magicLinkInfo) {
    throw new NotFoundError();
  }

  if (magicLinkInfo.expiresAt! < new Date()) {
    throw new TokenExpiredError();
  }

  const existingUser = await getUserByEmail(magicLinkInfo.email);

  if (existingUser) {
    // await setEmailVerified(existingUser.id);
    await deleteMagicToken(token);

    return existingUser;
  } else {
    const newUser = await createMagicUser(magicLinkInfo.email);

    await deleteMagicToken(token);

    return newUser;
  }
}

export async function signUpUser({ name, email, password }: RegisterPayload) {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new ValidationError({ email: ["Email is already taken"] });
    }

    await sendVerifyEmail(email);

    return { success: true, message: "Confirmation email sent!" } as const;
  }

  const user = await createUser({ email, name, password: bcrypt.hashSync(password, 10) });

  await sendVerifyEmail(email);

  return user;
}

export async function verifyEmail(token: string) {
  const tokenEntry = await getVerifyToken(token);

  if (!tokenEntry || tokenEntry.expiresAt <= new Date()) {
    throw new TokenExpiredError();
  }

  await updateUserByEmail(tokenEntry.email, { emailVerified: new Date() });

  await deleteVerifyToken(tokenEntry.email);
}

export async function forgotPassword(email: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new ValidationError({ email: ["Not exists!"] });
  }

  await sendPasswordResetTokenEmail(email);
}

export async function changePassword({ token, password }: { token: string; password: string }) {
  const tokenEntry = await getPasswordResetToken(token);

  if (!tokenEntry || tokenEntry.expiresAt <= new Date()) {
    throw new TokenExpiredError();
  }

  const user = await getUserByEmail(tokenEntry.email);

  if (!user) throw new NotFoundError();

  await updateUser(user.id, { password: bcrypt.hashSync(password, 10) });

  await deletePasswordResetToken(tokenEntry.email);
}
