CREATE TABLE `public_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`authorName` varchar(160) NOT NULL,
	`authorEmail` varchar(320),
	`content` text NOT NULL,
	`status` enum('pending','read','resolved') NOT NULL DEFAULT 'pending',
	`adminReply` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `public_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `public_posts_status_index` ON `public_posts` (`status`);--> statement-breakpoint
CREATE INDEX `public_posts_created_index` ON `public_posts` (`createdAt`);