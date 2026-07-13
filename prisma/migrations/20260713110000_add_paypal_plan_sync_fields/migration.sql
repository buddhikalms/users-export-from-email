ALTER TABLE `PricingPlan`
  ADD COLUMN `code` VARCHAR(191) NULL,
  ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
  ADD COLUMN `billingInterval` ENUM('MONTHLY', 'YEARLY', 'CUSTOM') NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN `billingIntervalCount` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `paypalSandboxProductId` VARCHAR(191) NULL,
  ADD COLUMN `paypalSandboxPlanId` VARCHAR(191) NULL,
  ADD COLUMN `paypalSandboxPlanStatus` VARCHAR(191) NULL,
  ADD COLUMN `paypalLiveProductId` VARCHAR(191) NULL,
  ADD COLUMN `paypalLivePlanId` VARCHAR(191) NULL,
  ADD COLUMN `paypalLivePlanStatus` VARCHAR(191) NULL,
  ADD COLUMN `lastSandboxSyncAt` DATETIME(3) NULL,
  ADD COLUMN `lastLiveSyncAt` DATETIME(3) NULL;

UPDATE `PricingPlan`
SET `code` = 'STARTER_MONTHLY'
WHERE `slug` = 'starter' AND `code` IS NULL;

UPDATE `PricingPlan`
SET `code` = 'PROFESSIONAL_MONTHLY'
WHERE `slug` = 'professional' AND `code` IS NULL;

UPDATE `PricingPlan`
SET `code` = 'BUSINESS_MONTHLY'
WHERE `slug` = 'business' AND `code` IS NULL;

CREATE UNIQUE INDEX `PricingPlan_code_key` ON `PricingPlan`(`code`);
CREATE INDEX `PricingPlan_code_idx` ON `PricingPlan`(`code`);
CREATE INDEX `PricingPlan_paypalSandboxPlanId_idx` ON `PricingPlan`(`paypalSandboxPlanId`);
CREATE INDEX `PricingPlan_paypalLivePlanId_idx` ON `PricingPlan`(`paypalLivePlanId`);
