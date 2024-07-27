import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import * as dbTable from "@/db/schema";
import { UserID } from "@/types";

export async function createAccount(data: Omit<typeof dbTable.accounts.$inferInsert, "id">) {
  const [account] = await db.insert(dbTable.accounts).values(data).returning();

  return account;
}

export async function createAccountViaGithub(userId: UserID, githubId: string) {
  await db
    .insert(dbTable.accounts)
    .values({
      userId: userId,
      accountType: "oauth",
      provider: "github",
      providerAccountId: githubId,
    })
    .onConflictDoNothing()
    .returning();
}

export async function createAccountViaGoogle(userId: UserID, googleId: string) {
  await db
    .insert(dbTable.accounts)
    .values({
      userId: userId,
      accountType: "oauth",
      provider: "google",
      providerAccountId: googleId,
    })
    .onConflictDoNothing()
    .returning();
}

export async function getAccountByUserId(userId: UserID) {
  const account = await db.query.accounts.findFirst({
    where: eq(dbTable.accounts.userId, userId),
  });

  return account;
}

export async function updateAccount(userId: UserID, data: Partial<Omit<typeof dbTable.accounts.$inferInsert, "id" | "userId">>) {
  await db
    .update(dbTable.accounts)
    .set(data)
    .where(and(eq(dbTable.accounts.userId, userId), eq(dbTable.accounts.accountType, "email")));
}

export async function getAccountByGoogleId(googleId: string) {
  return await db.query.accounts.findFirst({
    where: and(eq(dbTable.accounts.provider, "google"), eq(dbTable.accounts.providerAccountId, googleId)),
  });
}

export async function getAccountByGithubId(githubId: string) {
  return await db.query.accounts.findFirst({
    where: and(eq(dbTable.accounts.provider, "github"), eq(dbTable.accounts.providerAccountId, githubId)),
  });
}
