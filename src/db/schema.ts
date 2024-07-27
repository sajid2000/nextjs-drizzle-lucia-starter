import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

type AccountType = "email" | "oidc" | "oauth" | "webauthn";
type OAuthProvider = "google" | "github" | "facebook";

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: integer("emailVerifiedAt", { mode: "timestamp" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountType: text("accountType").$type<AccountType>().notNull(),
    provider: text("provider").$type<OAuthProvider>().notNull(),
    providerAccountId: text("providerAccountId").notNull(),
  },
  (account) => ({
    pk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: integer("expiresAt").notNull(),
});

export const magicLinks = sqliteTable("magicLink", {
  email: text("email").notNull().primaryKey(),
  token: text("token"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

export const resetTokens = sqliteTable("resetToken", {
  email: text("email").notNull().primaryKey(),
  token: text("token"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

export const verifyEmailTokens = sqliteTable("verifyEmailToken", {
  email: text("email").notNull().primaryKey(),
  token: text("token"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});
