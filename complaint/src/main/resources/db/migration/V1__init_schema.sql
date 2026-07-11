CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `created_at` datetime(6) DEFAULT NULL,
    CONSTRAINT `uq_users_email` UNIQUE (`email`)
);

CREATE TABLE `complaints` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `priority` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `admin_id` BIGINT DEFAULT NULL,
    `created_at` datetime(6) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    CONSTRAINT `fk_complaints_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_complaints_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
