CREATE TABLE `post_reposts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`clientId` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_reposts_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_reposts_post_client_unique` UNIQUE(`postId`,`clientId`)
);
--> statement-breakpoint
CREATE INDEX `post_reposts_post_idx` ON `post_reposts` (`postId`);