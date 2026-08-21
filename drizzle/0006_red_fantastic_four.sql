ALTER TABLE `cases` ADD `amountNeeded` varchar(80);--> statement-breakpoint
ALTER TABLE `cases` ADD `currency` varchar(16);--> statement-breakpoint
ALTER TABLE `cases` ADD `whyHelp` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `urgency` varchar(40);--> statement-breakpoint
ALTER TABLE `cases` ADD `deadline` varchar(40);--> statement-breakpoint
ALTER TABLE `cases` ADD `country` varchar(120);--> statement-breakpoint
ALTER TABLE `cases` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `cases` ADD `instituteName` varchar(240);--> statement-breakpoint
ALTER TABLE `cases` ADD `instituteContact` varchar(160);--> statement-breakpoint
ALTER TABLE `cases` ADD `instituteAddress` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `accountTitle` varchar(240);--> statement-breakpoint
ALTER TABLE `cases` ADD `accountNumber` varchar(120);--> statement-breakpoint
ALTER TABLE `cases` ADD `accountIban` varchar(120);--> statement-breakpoint
ALTER TABLE `cases` ADD `paymentMethod` varchar(80);--> statement-breakpoint
ALTER TABLE `cases` ADD `cnicNumber` varchar(80);--> statement-breakpoint
ALTER TABLE `cases` ADD `photoUrls` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `rejectionReason` text;