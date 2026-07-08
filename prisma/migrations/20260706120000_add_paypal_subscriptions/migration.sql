-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `plan` ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'AGENCY', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
    `interval` ENUM('MONTHLY', 'YEARLY', 'CUSTOM') NOT NULL DEFAULT 'MONTHLY',
    `status` ENUM('FREE', 'APPROVAL_PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'FREE',
    `provider` VARCHAR(191) NOT NULL DEFAULT 'paypal',
    `paypalSubscriptionId` VARCHAR(191) NULL,
    `paypalPlanId` VARCHAR(191) NULL,
    `payerEmail` VARCHAR(191) NULL,
    `currentPeriodEnd` DATETIME(3) NULL,
    `lastPaymentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscription_userId_key`(`userId`),
    UNIQUE INDEX `Subscription_paypalSubscriptionId_key`(`paypalSubscriptionId`),
    INDEX `Subscription_status_idx`(`status`),
    INDEX `Subscription_paypalPlanId_idx`(`paypalPlanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayPalWebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `paypalEventId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PayPalWebhookEvent_paypalEventId_key`(`paypalEventId`),
    INDEX `PayPalWebhookEvent_eventType_idx`(`eventType`),
    INDEX `PayPalWebhookEvent_resourceId_idx`(`resourceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
