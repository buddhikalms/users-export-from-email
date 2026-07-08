CREATE INDEX `Contact_ownerId_createdAt_idx` ON `Contact`(`ownerId`, `createdAt`);
CREATE INDEX `Contact_ownerId_updatedAt_idx` ON `Contact`(`ownerId`, `updatedAt`);
CREATE INDEX `Contact_ownerId_lastSeenAt_idx` ON `Contact`(`ownerId`, `lastSeenAt`);
CREATE INDEX `Contact_ownerId_status_idx` ON `Contact`(`ownerId`, `status`);
CREATE INDEX `Contact_email_idx` ON `Contact`(`email`);

CREATE INDEX `IntegrationAccount_platform_createdAt_idx` ON `IntegrationAccount`(`platform`, `createdAt`);

CREATE INDEX `SyncRun_platform_createdAt_idx` ON `SyncRun`(`platform`, `createdAt`);

CREATE INDEX `ExportRun_createdAt_idx` ON `ExportRun`(`createdAt`);
