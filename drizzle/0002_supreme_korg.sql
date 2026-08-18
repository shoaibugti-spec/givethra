ALTER TABLE `cases` ADD `targetAmount` int DEFAULT 6000 NOT NULL;--> statement-breakpoint
ALTER TABLE `cases` ADD `expiryDate` varchar(50);--> statement-breakpoint
ALTER TABLE `cases` ADD `location` varchar(160);