-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `article` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE `article`;

-- Create posts table
CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `status` VARCHAR(100) NOT NULL,
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

