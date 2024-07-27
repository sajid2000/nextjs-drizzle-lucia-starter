import { eq } from "drizzle-orm";

import config from "@/config";
import { db } from "@/db";
import * as dbTabel from "@/db/schema";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { VerifyEmail } from "@/emails/verify-email";
import { sendEmail } from "@/lib/email";
import { ApplicationError } from "@/lib/errors";
import { generateRandomToken } from "@/lib/utils";
import {
  deletePasswordResetToken,
  deleteVerifyToken,
  getPasswordResetTokenByEmail,
  getVerifyTokenByEmail,
  insertPasswordResetToken,
  insertVerifyToken,
} from "@/repositories/tokens";

const TOKEN_LENGTH = 32;
const TOKEN_TTL = 1000 * 60 * 5; // 5 min
const VERIFY_EMAIL_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function sendPasswordResetTokenEmail(email: string) {
  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    if (existingToken.expiresAt >= new Date()) {
      throw new ApplicationError("Email already sent. Try after a few minutes");
    }

    await deletePasswordResetToken(email);
  }

  // if token not exists or expiresAt, send new verify link
  const token = await generateRandomToken(TOKEN_LENGTH);
  const expiresAt = new Date(Date.now() + TOKEN_TTL);
  console.log(token);

  await insertPasswordResetToken({ email, token, expiresAt });

  await sendEmail(email, `Your password reset link for ${config.appName}`, ResetPasswordEmail({ token }));
}

export async function sendVerifyEmail(email: string) {
  const existingToken = await getVerifyTokenByEmail(email);

  if (existingToken) {
    console.log((new Date(existingToken.expiresAt).getTime() - Date.now()) / 1000);
    if (existingToken.expiresAt >= new Date()) {
      throw new ApplicationError("Email already sent. Try after a few minutes");
    }

    await deleteVerifyToken(email);
  }

  // if token not exists or expiresAt, send new verify link
  const token = await generateRandomToken(TOKEN_LENGTH);
  const expiresAt = new Date(Date.now() + TOKEN_TTL);
  console.log(token);

  await insertVerifyToken({ email, token, expiresAt });

  await sendEmail(email, `Verify your email for ${config.appName}`, VerifyEmail({ token }));
}

export async function upsertMagicLink(email: string) {
  const token = await generateRandomToken(TOKEN_LENGTH);
  const expiresAt = new Date(Date.now() + TOKEN_TTL);

  await db
    .insert(dbTabel.magicLinks)
    .values({
      email,
      token,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: dbTabel.magicLinks.email,
      set: {
        token,
        expiresAt,
      },
    });

  return token;
}

export async function getMagicLinkByToken(token: string) {
  const existingToken = await db.query.magicLinks.findFirst({
    where: eq(dbTabel.magicLinks.token, token),
  });

  return existingToken;
}

export async function deleteMagicToken(token: string) {
  await db.delete(dbTabel.magicLinks).where(eq(dbTabel.magicLinks.token, token));
}
