CREATE TABLE `case_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`storageUrl` varchar(1000) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `case_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`selfieKey` varchar(500),
	`selfieUrl` varchar(1000),
	`videoKey` varchar(500),
	`videoUrl` varchar(1000),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`reviewedByUserId` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kyc_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(180) NOT NULL,
	`nationalId` varchar(80) NOT NULL,
	`frontKey` varchar(500) NOT NULL,
	`frontUrl` varchar(1000) NOT NULL,
	`backKey` varchar(500) NOT NULL,
	`backUrl` varchar(1000) NOT NULL,
	`selfieKey` varchar(500) NOT NULL,
	`selfieUrl` varchar(1000) NOT NULL,
	`videoKey` varchar(500) NOT NULL,
	`videoUrl` varchar(1000) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`reviewedByUserId` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `kyc_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('kyc','case','message','system') NOT NULL,
	`title` varchar(180) NOT NULL,
	`content` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(160),
	`phone` varchar(40),
	`city` varchar(120),
	`country` varchar(120),
	`bio` text,
	`avatarKey` varchar(500),
	`avatarUrl` varchar(1000),
	`coverKey` varchar(500),
	`coverUrl` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`senderRole` enum('user','admin') NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(128) NOT NULL;--> statement-breakpoint
CREATE INDEX `case_files_case_index` ON `case_files` (`caseId`);--> statement-breakpoint
CREATE INDEX `cases_status_category_index` ON `cases` (`status`,`category`);--> statement-breakpoint
CREATE INDEX `cases_user_submitted_index` ON `cases` (`userId`,`submittedAt`);--> statement-breakpoint
CREATE INDEX `kyc_user_submitted_index` ON `kyc_submissions` (`userId`,`submittedAt`);--> statement-breakpoint
CREATE INDEX `kyc_status_index` ON `kyc_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `notifications_user_created_index` ON `notifications` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `support_messages_user_created_index` ON `support_messages` (`userId`,`createdAt`);