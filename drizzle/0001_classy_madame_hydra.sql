CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`clientId` varchar(96) NOT NULL,
	`authorName` varchar(120) NOT NULL DEFAULT 'Sasha Volkova',
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`clientId` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_likes_post_client_unique` UNIQUE(`postId`,`clientId`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(80) NOT NULL,
	`creatorName` varchar(120) NOT NULL,
	`handle` varchar(80) NOT NULL,
	`caption` text NOT NULL,
	`tags` varchar(255) NOT NULL,
	`accent` varchar(24) NOT NULL DEFAULT 'violet',
	`posterUrl` text,
	`videoUrl` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE INDEX `comments_post_idx` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX `post_likes_post_idx` ON `post_likes` (`postId`);