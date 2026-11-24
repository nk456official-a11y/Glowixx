CREATE TABLE `post_saves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`clientId` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_saves_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_saves_post_client_unique` UNIQUE(`postId`,`clientId`)
);
--> statement-breakpoint
CREATE INDEX `post_saves_post_idx` ON `post_saves` (`postId`);