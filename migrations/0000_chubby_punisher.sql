CREATE TABLE `accounts` (
	`userId` text NOT NULL,
	`accountType` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `magicLink` (
	`email` text PRIMARY KEY NOT NULL,
	`token` text,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resetToken` (
	`email` text PRIMARY KEY NOT NULL,
	`token` text,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`password` text,
	`emailVerifiedAt` integer,
	`image` text
);
--> statement-breakpoint
CREATE TABLE `verifyEmailToken` (
	`email` text PRIMARY KEY NOT NULL,
	`token` text,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);