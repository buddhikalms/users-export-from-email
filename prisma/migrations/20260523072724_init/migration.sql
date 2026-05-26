-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `plan` VARCHAR(191) NOT NULL DEFAULT 'starter',
    `monthlyContactLimit` INTEGER NOT NULL DEFAULT 10000,
    `monthlyApiLimit` INTEGER NOT NULL DEFAULT 50000,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_slug_key`(`slug`),
    INDEX `Organization_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizationMember` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER', 'VIEWER') NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrganizationMember_userId_idx`(`userId`),
    UNIQUE INDEX `OrganizationMember_organizationId_userId_key`(`organizationId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workspace` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Workspace_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `Workspace_organizationId_slug_key`(`organizationId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedEmailAccount` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `host` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `security` ENUM('ssl_tls', 'starttls') NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `encryptedPassword` VARCHAR(191) NOT NULL,
    `encryptionIv` VARCHAR(191) NOT NULL,
    `encryptionTag` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SavedEmailAccount_ownerId_idx`(`ownerId`),
    UNIQUE INDEX `SavedEmailAccount_ownerId_label_key`(`ownerId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IgnoredEmail` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IgnoredEmail_ownerId_idx`(`ownerId`),
    UNIQUE INDEX `IgnoredEmail_ownerId_email_key`(`ownerId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KitSettings` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `apiVersion` ENUM('v4', 'v3') NOT NULL DEFAULT 'v4',
    `encryptedApiKey` VARCHAR(191) NOT NULL,
    `encryptedApiSecret` VARCHAR(191) NULL,
    `encryptionIv` VARCHAR(191) NOT NULL,
    `encryptionTag` VARCHAR(191) NOT NULL,
    `secretEncryptionIv` VARCHAR(191) NULL,
    `secretEncryptionTag` VARCHAR(191) NULL,
    `defaultTagId` VARCHAR(191) NULL,
    `defaultFormId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KitSettings_ownerId_key`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KitFolderTagMap` (
    `id` VARCHAR(191) NOT NULL,
    `kitSettingsId` VARCHAR(191) NOT NULL,
    `folderPath` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,
    `tagName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KitFolderTagMap_kitSettingsId_idx`(`kitSettingsId`),
    UNIQUE INDEX `KitFolderTagMap_kitSettingsId_folderPath_key`(`kitSettingsId`, `folderPath`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KitAccount` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `apiVersion` ENUM('v4', 'v3') NOT NULL DEFAULT 'v4',
    `encryptedApiKey` VARCHAR(191) NOT NULL,
    `encryptedApiSecret` VARCHAR(191) NULL,
    `encryptionIv` VARCHAR(191) NOT NULL,
    `encryptionTag` VARCHAR(191) NOT NULL,
    `secretEncryptionIv` VARCHAR(191) NULL,
    `secretEncryptionTag` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KitAccount_ownerId_idx`(`ownerId`),
    UNIQUE INDEX `KitAccount_ownerId_name_key`(`ownerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `normalizedEmail` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `domain` VARCHAR(191) NULL,
    `emailClassification` ENUM('BUSINESS', 'PERSONAL', 'ROLE_BASED', 'DISPOSABLE', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `sourceType` ENUM('DIRECT_EMAIL', 'FORWARDED_EMAIL', 'ORIGINAL_SENDER', 'REPLY_TO', 'MANUAL_IMPORT', 'API_IMPORT') NOT NULL DEFAULT 'DIRECT_EMAIL',
    `sourceFolder` VARCHAR(191) NULL,
    `forwardedBy` VARCHAR(191) NULL,
    `originalSender` VARCHAR(191) NULL,
    `duplicateScore` INTEGER NOT NULL DEFAULT 0,
    `leadScore` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('NEW', 'QUALIFIED', 'NURTURING', 'CUSTOMER', 'UNSUBSCRIBED', 'BOUNCED', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
    `starred` BOOLEAN NOT NULL DEFAULT false,
    `firstSeenAt` DATETIME(3) NULL,
    `lastSeenAt` DATETIME(3) NULL,
    `emailCount` INTEGER NOT NULL DEFAULT 1,
    `aiCategory` VARCHAR(191) NULL,
    `aiSummary` VARCHAR(191) NULL,
    `aiConfidence` DOUBLE NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Contact_ownerId_domain_idx`(`ownerId`, `domain`),
    INDEX `Contact_workspaceId_idx`(`workspaceId`),
    INDEX `Contact_status_idx`(`status`),
    UNIQUE INDEX `Contact_ownerId_normalizedEmail_key`(`ownerId`, `normalizedEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactNote` (
    `id` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `body` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactNote_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactTag` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactTag_ownerId_idx`(`ownerId`),
    UNIQUE INDEX `ContactTag_ownerId_name_key`(`ownerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactTagAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactTagAssignment_tagId_idx`(`tagId`),
    UNIQUE INDEX `ContactTagAssignment_contactId_tagId_key`(`contactId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactActivity` (
    `id` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactActivity_contactId_idx`(`contactId`),
    INDEX `ContactActivity_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IntegrationAccount` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NULL,
    `platform` ENUM('KIT', 'MAILCHIMP', 'BREVO', 'BEEHIIV', 'ACTIVECAMPAIGN', 'CONVERTKIT_LEGACY', 'HUBSPOT', 'MAILERLITE', 'CONSTANT_CONTACT', 'SENDGRID_MARKETING', 'CAMPAIGN_MONITOR') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `encryptedApiKey` VARCHAR(191) NOT NULL,
    `encryptedApiSecret` VARCHAR(191) NULL,
    `encryptionIv` VARCHAR(191) NOT NULL,
    `encryptionTag` VARCHAR(191) NOT NULL,
    `secretEncryptionIv` VARCHAR(191) NULL,
    `secretEncryptionTag` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `health` ENUM('UNKNOWN', 'HEALTHY', 'DEGRADED', 'FAILED') NOT NULL DEFAULT 'UNKNOWN',
    `lastTestedAt` DATETIME(3) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `rateLimitRemaining` INTEGER NULL,
    `externalAccountId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IntegrationAccount_ownerId_platform_idx`(`ownerId`, `platform`),
    INDEX `IntegrationAccount_workspaceId_idx`(`workspaceId`),
    UNIQUE INDEX `IntegrationAccount_ownerId_platform_name_key`(`ownerId`, `platform`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IntegrationDestination` (
    `id` VARCHAR(191) NOT NULL,
    `integrationAccountId` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `contactCount` INTEGER NULL,
    `metadata` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IntegrationDestination_integrationAccountId_idx`(`integrationAccountId`),
    UNIQUE INDEX `IntegrationDestination_integrationAccountId_externalId_type_key`(`integrationAccountId`, `externalId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SyncRun` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NULL,
    `integrationAccountId` VARCHAR(191) NULL,
    `platform` ENUM('KIT', 'MAILCHIMP', 'BREVO', 'BEEHIIV', 'ACTIVECAMPAIGN', 'CONVERTKIT_LEGACY', 'HUBSPOT', 'MAILERLITE', 'CONSTANT_CONTACT', 'SENDGRID_MARKETING', 'CAMPAIGN_MONITOR') NULL,
    `status` ENUM('QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    `targetType` VARCHAR(191) NULL,
    `targetId` VARCHAR(191) NULL,
    `targetName` VARCHAR(191) NULL,
    `totalContacts` INTEGER NOT NULL DEFAULT 0,
    `uploaded` INTEGER NOT NULL DEFAULT 0,
    `updated` INTEGER NOT NULL DEFAULT 0,
    `skippedDuplicates` INTEGER NOT NULL DEFAULT 0,
    `failed` INTEGER NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SyncRun_workspaceId_createdAt_idx`(`workspaceId`, `createdAt`),
    INDEX `SyncRun_integrationAccountId_idx`(`integrationAccountId`),
    INDEX `SyncRun_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExportRun` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NULL,
    `integrationAccountId` VARCHAR(191) NULL,
    `format` ENUM('EXCEL', 'CSV', 'JSON') NOT NULL,
    `status` ENUM('QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    `fileName` VARCHAR(191) NULL,
    `totalContacts` INTEGER NOT NULL DEFAULT 0,
    `exportedContacts` INTEGER NOT NULL DEFAULT 0,
    `failedContacts` INTEGER NOT NULL DEFAULT 0,
    `filterSnapshot` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `errorMessage` VARCHAR(191) NULL,

    INDEX `ExportRun_workspaceId_createdAt_idx`(`workspaceId`, `createdAt`),
    INDEX `ExportRun_format_idx`(`format`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DuplicateCleanupLog` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NULL,
    `duplicateEmail` VARCHAR(191) NOT NULL,
    `duplicateCount` INTEGER NOT NULL,
    `winningContactId` VARCHAR(191) NULL,
    `strategy` VARCHAR(191) NOT NULL,
    `confidence` INTEGER NOT NULL DEFAULT 0,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DuplicateCleanupLog_ownerId_createdAt_idx`(`ownerId`, `createdAt`),
    INDEX `DuplicateCleanupLog_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApiLog` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NULL,
    `workspaceId` VARCHAR(191) NULL,
    `platform` ENUM('KIT', 'MAILCHIMP', 'BREVO', 'BEEHIIV', 'ACTIVECAMPAIGN', 'CONVERTKIT_LEGACY', 'HUBSPOT', 'MAILERLITE', 'CONSTANT_CONTACT', 'SENDGRID_MARKETING', 'CAMPAIGN_MONITOR') NULL,
    `action` VARCHAR(191) NOT NULL,
    `statusCode` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `durationMs` INTEGER NULL,
    `requestId` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ApiLog_ownerId_createdAt_idx`(`ownerId`, `createdAt`),
    INDEX `ApiLog_workspaceId_createdAt_idx`(`workspaceId`, `createdAt`),
    INDEX `ApiLog_platform_idx`(`platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NULL,
    `readAt` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_ownerId_readAt_idx`(`ownerId`, `readAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AutomationRule` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `trigger` ENUM('SCHEDULED', 'FOLDER_SYNCED', 'CONTACT_CREATED', 'TAG_MATCHED', 'MANUAL') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `schedule` VARCHAR(191) NULL,
    `conditions` JSON NULL,
    `actions` JSON NULL,
    `lastRunAt` DATETIME(3) NULL,
    `nextRunAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AutomationRule_ownerId_enabled_idx`(`ownerId`, `enabled`),
    INDEX `AutomationRule_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BackgroundJob` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NULL,
    `workspaceId` VARCHAR(191) NULL,
    `type` ENUM('MAILBOX_SYNC', 'CONTACT_CLEANUP', 'PLATFORM_SYNC', 'FILE_EXPORT', 'AUTOMATION_RUN', 'AI_ENRICHMENT') NOT NULL,
    `status` ENUM('QUEUED', 'RUNNING', 'RETRYING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 3,
    `runAfter` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `payload` JSON NULL,
    `result` JSON NULL,
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BackgroundJob_status_runAfter_idx`(`status`, `runAfter`),
    INDEX `BackgroundJob_ownerId_idx`(`ownerId`),
    INDEX `BackgroundJob_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedEmailAccount` ADD CONSTRAINT `SavedEmailAccount_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IgnoredEmail` ADD CONSTRAINT `IgnoredEmail_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KitSettings` ADD CONSTRAINT `KitSettings_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KitFolderTagMap` ADD CONSTRAINT `KitFolderTagMap_kitSettingsId_fkey` FOREIGN KEY (`kitSettingsId`) REFERENCES `KitSettings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KitAccount` ADD CONSTRAINT `KitAccount_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactNote` ADD CONSTRAINT `ContactNote_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactTagAssignment` ADD CONSTRAINT `ContactTagAssignment_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactTagAssignment` ADD CONSTRAINT `ContactTagAssignment_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `ContactTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactActivity` ADD CONSTRAINT `ContactActivity_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntegrationAccount` ADD CONSTRAINT `IntegrationAccount_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntegrationAccount` ADD CONSTRAINT `IntegrationAccount_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntegrationDestination` ADD CONSTRAINT `IntegrationDestination_integrationAccountId_fkey` FOREIGN KEY (`integrationAccountId`) REFERENCES `IntegrationAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SyncRun` ADD CONSTRAINT `SyncRun_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SyncRun` ADD CONSTRAINT `SyncRun_integrationAccountId_fkey` FOREIGN KEY (`integrationAccountId`) REFERENCES `IntegrationAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExportRun` ADD CONSTRAINT `ExportRun_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExportRun` ADD CONSTRAINT `ExportRun_integrationAccountId_fkey` FOREIGN KEY (`integrationAccountId`) REFERENCES `IntegrationAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApiLog` ADD CONSTRAINT `ApiLog_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApiLog` ADD CONSTRAINT `ApiLog_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AutomationRule` ADD CONSTRAINT `AutomationRule_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AutomationRule` ADD CONSTRAINT `AutomationRule_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BackgroundJob` ADD CONSTRAINT `BackgroundJob_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BackgroundJob` ADD CONSTRAINT `BackgroundJob_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
