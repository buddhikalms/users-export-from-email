-- Enterprise admin console, queue control, licensing, and operational observability.

CREATE TABLE `AdminRole` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `role` ENUM('SUPER_ADMIN','ADMIN','SUPPORT_ADMIN','BILLING_ADMIN','OPERATIONS_ADMIN','SECURITY_ADMIN','READ_ONLY_ADMIN') NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `assignedBy` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AdminRole_userId_role_key` (`userId`, `role`),
  INDEX `AdminRole_role_idx` (`role`),
  CONSTRAINT `AdminRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AdminPermission` (
  `id` VARCHAR(191) NOT NULL,
  `adminRoleId` VARCHAR(191) NOT NULL,
  `permission` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AdminPermission_adminRoleId_permission_key` (`adminRoleId`, `permission`),
  INDEX `AdminPermission_permission_idx` (`permission`),
  CONSTRAINT `AdminPermission_adminRoleId_fkey` FOREIGN KEY (`adminRoleId`) REFERENCES `AdminRole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AdminAuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `adminUserId` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `resourceType` VARCHAR(191) NOT NULL,
  `resourceId` VARCHAR(191) NULL,
  `beforeState` JSON NULL,
  `afterState` JSON NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  `requestId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AdminAuditLog_adminUserId_createdAt_idx` (`adminUserId`, `createdAt`),
  INDEX `AdminAuditLog_resourceType_resourceId_idx` (`resourceType`, `resourceId`),
  INDEX `AdminAuditLog_action_idx` (`action`),
  INDEX `AdminAuditLog_createdAt_idx` (`createdAt`),
  CONSTRAINT `AdminAuditLog_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `QueueConfiguration` (
  `id` VARCHAR(191) NOT NULL,
  `queueName` VARCHAR(191) NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `concurrency` INTEGER NOT NULL DEFAULT 5,
  `maxJobsPerMinute` INTEGER NOT NULL DEFAULT 120,
  `maxJobsPerTenant` INTEGER NOT NULL DEFAULT 3,
  `maxJobsPerUser` INTEGER NOT NULL DEFAULT 2,
  `timeoutMs` INTEGER NOT NULL DEFAULT 900000,
  `maxAttempts` INTEGER NOT NULL DEFAULT 3,
  `retryBackoffMs` INTEGER NOT NULL DEFAULT 30000,
  `priorityWeight` INTEGER NOT NULL DEFAULT 10,
  `workerHeartbeatMs` INTEGER NOT NULL DEFAULT 30000,
  `maxStalledJobCount` INTEGER NOT NULL DEFAULT 2,
  `maintenanceWindow` VARCHAR(191) NULL,
  `peakSettings` JSON NULL,
  `offPeakSettings` JSON NULL,
  `completedRetentionMs` INTEGER NOT NULL DEFAULT 604800000,
  `failedRetentionMs` INTEGER NOT NULL DEFAULT 1209600000,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `QueueConfiguration_queueName_key` (`queueName`),
  INDEX `QueueConfiguration_enabled_idx` (`enabled`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `WorkerHeartbeat` (
  `id` VARCHAR(191) NOT NULL,
  `workerName` VARCHAR(191) NOT NULL,
  `queueName` VARCHAR(191) NOT NULL,
  `state` VARCHAR(191) NOT NULL DEFAULT 'online',
  `lastHeartbeatAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `runningJobs` INTEGER NOT NULL DEFAULT 0,
  `completedJobs` INTEGER NOT NULL DEFAULT 0,
  `failedJobs` INTEGER NOT NULL DEFAULT 0,
  `memoryMb` INTEGER NULL,
  `cpuPercent` DOUBLE NULL,
  `uptimeSeconds` INTEGER NULL,
  `concurrency` INTEGER NOT NULL DEFAULT 1,
  `hostname` VARCHAR(191) NULL,
  `appVersion` VARCHAR(191) NULL,
  `lastError` TEXT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `WorkerHeartbeat_workerName_queueName_key` (`workerName`, `queueName`),
  INDEX `WorkerHeartbeat_queueName_state_idx` (`queueName`, `state`),
  INDEX `WorkerHeartbeat_lastHeartbeatAt_idx` (`lastHeartbeatAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SystemIncident` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `severity` ENUM('INFO','WARNING','ERROR','CRITICAL') NOT NULL DEFAULT 'INFO',
  `status` ENUM('OPEN','INVESTIGATING','RESOLVED') NOT NULL DEFAULT 'OPEN',
  `source` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `resolvedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `SystemIncident_severity_status_idx` (`severity`, `status`),
  INDEX `SystemIncident_createdAt_idx` (`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FeatureFlag` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT false,
  `description` TEXT NULL,
  `rules` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `FeatureFlag_key_key` (`key`),
  INDEX `FeatureFlag_enabled_idx` (`enabled`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Package` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `monthlyPrice` DECIMAL(10,2) NULL,
  `yearlyPrice` DECIMAL(10,2) NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
  `emailAccountLimit` INTEGER NOT NULL DEFAULT 1,
  `monthlyScanLimit` INTEGER NOT NULL DEFAULT 500,
  `contactLimit` INTEGER NOT NULL DEFAULT 1000,
  `teamMemberLimit` INTEGER NOT NULL DEFAULT 1,
  `integrationLimit` INTEGER NOT NULL DEFAULT 1,
  `supportLevel` VARCHAR(191) NOT NULL DEFAULT 'standard',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Package_code_key` (`code`),
  INDEX `Package_isActive_sortOrder_idx` (`isActive`, `sortOrder`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PackageFeature` (
  `id` VARCHAR(191) NOT NULL,
  `packageId` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `limit` INTEGER NULL,
  `metadata` JSON NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PackageFeature_packageId_key_key` (`packageId`, `key`),
  INDEX `PackageFeature_key_idx` (`key`),
  CONSTRAINT `PackageFeature_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Licence` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `packageId` VARCHAR(191) NULL,
  `plan` VARCHAR(191) NOT NULL DEFAULT 'free',
  `status` ENUM('ACTIVE','SUSPENDED','REVOKED','EXPIRED','PENDING') NOT NULL DEFAULT 'PENDING',
  `activationLimit` INTEGER NOT NULL DEFAULT 1,
  `expiresAt` DATETIME(3) NULL,
  `lastValidatedAt` DATETIME(3) NULL,
  `suspiciousAttempts` INTEGER NOT NULL DEFAULT 0,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Licence_key_key` (`key`),
  INDEX `Licence_userId_idx` (`userId`),
  INDEX `Licence_packageId_idx` (`packageId`),
  INDEX `Licence_status_expiresAt_idx` (`status`, `expiresAt`),
  CONSTRAINT `Licence_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Licence_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LicenceActivation` (
  `id` VARCHAR(191) NOT NULL,
  `licenceId` VARCHAR(191) NOT NULL,
  `domain` VARCHAR(191) NULL,
  `installationId` VARCHAR(191) NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  `validatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` VARCHAR(191) NOT NULL DEFAULT 'active',
  `metadata` JSON NULL,
  PRIMARY KEY (`id`),
  INDEX `LicenceActivation_licenceId_validatedAt_idx` (`licenceId`, `validatedAt`),
  INDEX `LicenceActivation_domain_idx` (`domain`),
  INDEX `LicenceActivation_installationId_idx` (`installationId`),
  CONSTRAINT `LicenceActivation_licenceId_fkey` FOREIGN KEY (`licenceId`) REFERENCES `Licence`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Addon` (
  `id` VARCHAR(191) NOT NULL,
  `subscriptionId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Addon_subscriptionId_idx` (`subscriptionId`),
  INDEX `Addon_code_idx` (`code`),
  CONSTRAINT `Addon_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `WorkspaceLimitOverride` (
  `id` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `queueConcurrencyLimit` INTEGER NULL,
  `emailScanLimit` INTEGER NULL,
  `contactExportLimit` INTEGER NULL,
  `integrationLimit` INTEGER NULL,
  `featureFlags` JSON NULL,
  `packageOverrides` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `WorkspaceLimitOverride_workspaceId_key` (`workspaceId`),
  CONSTRAINT `WorkspaceLimitOverride_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Subscription`
  ADD COLUMN `packageId` VARCHAR(191) NULL,
  ADD COLUMN `amount` DECIMAL(10,2) NULL,
  ADD COLUMN `failedPaymentCount` INTEGER NOT NULL DEFAULT 0;

CREATE INDEX `Subscription_packageId_idx` ON `Subscription`(`packageId`);

ALTER TABLE `Subscription`
  ADD CONSTRAINT `Subscription_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
