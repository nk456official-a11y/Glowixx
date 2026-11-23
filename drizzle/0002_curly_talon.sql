CREATE TABLE `comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`clientId` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `comment_likes_comment_client_unique` UNIQUE(`commentId`,`clientId`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD `parentId` int;--> statement-breakpoint
CREATE INDEX `comment_likes_comment_idx` ON `comment_likes` (`commentId`);--> statement-breakpoint
CREATE INDEX `comments_parent_idx` ON `comments` (`parentId`);