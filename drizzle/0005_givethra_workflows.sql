ALTER TABLE `users` ADD COLUMN `accountStatus` enum('active','suspended') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `credits` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `suspendedAt` timestamp NULL;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `suspensionNote` text NULL;--> statement-breakpoint
ALTER TABLE `cases` MODIFY COLUMN `status` enum('pending','approved','rejected','complete','expired') NOT NULL DEFAULT 'pending';--> statement-breakpoint
CREATE INDEX `users_account_status_index` ON `users` (`accountStatus`);--> statement-breakpoint
CREATE TABLE `case_interactions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `caseId` int NOT NULL,
  `userId` int NOT NULL,
  `kind` enum('unlock','contribution','direct_help') NOT NULL,
  `status` enum('pending','approved','rejected','complete','expired') NOT NULL DEFAULT 'pending',
  `unlockCost` int NOT NULL DEFAULT 0,
  `amount` int NULL,
  `txnNumber` varchar(180) NULL,
  `paymentProofKey` varchar(500) NULL,
  `paymentProofUrl` varchar(1000) NULL,
  `adminNote` text NULL,
  `grade` varchar(500) NULL,
  `reviewedByUserId` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `reviewedAt` timestamp NULL,
  `completedAt` timestamp NULL,
  CONSTRAINT `case_interactions_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
CREATE INDEX `case_interactions_case_index` ON `case_interactions` (`caseId`);--> statement-breakpoint
CREATE INDEX `case_interactions_user_status_index` ON `case_interactions` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `case_interactions_kind_status_index` ON `case_interactions` (`kind`,`status`);--> statement-breakpoint
CREATE TABLE `case_feedback` (
  `id` int AUTO_INCREMENT NOT NULL,
  `caseId` int NOT NULL,
  `userId` int NOT NULL,
  `videoKey` varchar(500) NOT NULL,
  `videoUrl` varchar(1000) NOT NULL,
  `caption` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `adminNote` text NULL,
  `reviewedByUserId` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `reviewedAt` timestamp NULL,
  CONSTRAINT `case_feedback_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
CREATE INDEX `case_feedback_case_index` ON `case_feedback` (`caseId`);--> statement-breakpoint
CREATE INDEX `case_feedback_status_index` ON `case_feedback` (`status`);
