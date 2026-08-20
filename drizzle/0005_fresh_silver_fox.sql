CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionToken` varchar(128) NOT NULL,
	`senderName` varchar(160) NOT NULL,
	`senderEmail` varchar(320),
	`ipAddress` varchar(64),
	`content` text NOT NULL,
	`status` enum('unread','read','replied') NOT NULL DEFAULT 'unread',
	`adminReply` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `feedbacks_session_index` ON `feedbacks` (`sessionToken`);--> statement-breakpoint
CREATE INDEX `feedbacks_user_index` ON `feedbacks` (`userId`);--> statement-breakpoint
CREATE INDEX `feedbacks_created_index` ON `feedbacks` (`createdAt`);