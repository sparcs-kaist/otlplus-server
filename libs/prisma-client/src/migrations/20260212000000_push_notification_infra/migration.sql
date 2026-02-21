-- CreateEnum: NotificationScheduleType, NotificationTargetType, NotificationPriority, NotificationHistoryStatus
-- These are Prisma-level enums; MySQL stores them as ENUM columns.

-- AlterTable: session_userprofile_device - add created_at, updated_at
ALTER TABLE `session_userprofile_device`
  ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: push_notification
CREATE TABLE `push_notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `type` ENUM('INFO', 'MARKETING', 'NIGHT_MARKETING') NOT NULL,
    `titleTemplate` VARCHAR(500) NOT NULL,
    `bodyTemplate` LONGTEXT NOT NULL,
    `targetType` ENUM('ALL', 'SEGMENT', 'MANUAL') NOT NULL,
    `targetFilter` JSON NULL,
    `scheduleType` ENUM('IMMEDIATE', 'ONE_TIME', 'CRON') NOT NULL,
    `scheduleAt` DATETIME(0) NULL,
    `cronExpression` VARCHAR(100) NULL,
    `priority` ENUM('URGENT', 'NORMAL', 'LOW') NOT NULL DEFAULT 'NORMAL',
    `digestKey` VARCHAR(100) NULL,
    `digestWindowSec` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `push_notification_name_uniq`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: push_notification_batch
CREATE TABLE `push_notification_batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notificationId` INTEGER NOT NULL,
    `batchId` VARCHAR(36) NOT NULL,
    `totalCount` INTEGER NOT NULL,
    `sentCount` INTEGER NOT NULL DEFAULT 0,
    `failedCount` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `startedAt` DATETIME(0) NULL,
    `completedAt` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `push_notification_batch_batchId_uniq`(`batchId`),
    INDEX `push_notification_batch_notificationId_fkey`(`notificationId`),
    INDEX `push_notification_batch_status_index`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: push_notification_history
CREATE TABLE `push_notification_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchId` INTEGER NOT NULL,
    `notificationId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `deviceId` INTEGER NULL,
    `fcmToken` VARCHAR(255) NULL,
    `notificationType` ENUM('INFO', 'MARKETING', 'NIGHT_MARKETING') NOT NULL,
    `priority` ENUM('URGENT', 'NORMAL', 'LOW') NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `status` ENUM('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'DLQ') NOT NULL DEFAULT 'QUEUED',
    `fcmMessageId` VARCHAR(255) NULL,
    `errorCode` VARCHAR(100) NULL,
    `errorMessage` LONGTEXT NULL,
    `idempotencyKey` VARCHAR(255) NOT NULL,
    `queuedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `sentAt` DATETIME(0) NULL,
    `deliveredAt` DATETIME(0) NULL,
    `readAt` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `push_notification_history_idempotencyKey_uniq`(`idempotencyKey`),
    INDEX `push_notification_history_batchId_fkey`(`batchId`),
    INDEX `push_notification_history_notificationId_fkey`(`notificationId`),
    INDEX `push_notification_history_userId_index`(`userId`),
    INDEX `push_notification_history_status_index`(`status`),
    INDEX `push_notification_history_userId_status_index`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: user_push_agreement
CREATE TABLE `user_push_agreement` (
    `userId` INTEGER NOT NULL,
    `info` BOOLEAN NOT NULL DEFAULT true,
    `marketing` BOOLEAN NOT NULL DEFAULT false,
    `nightMarketing` BOOLEAN NOT NULL DEFAULT false,
    `detailVersion` INTEGER NOT NULL DEFAULT 1,
    `detail` JSON NULL,
    `agreedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `push_notification_batch` ADD CONSTRAINT `push_notification_batch_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `push_notification`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `push_notification_history` ADD CONSTRAINT `push_notification_history_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `push_notification_batch`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `push_notification_history` ADD CONSTRAINT `push_notification_history_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `push_notification`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
