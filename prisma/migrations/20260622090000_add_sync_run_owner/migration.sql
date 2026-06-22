ALTER TABLE `SyncRun` ADD COLUMN `ownerId` VARCHAR(191) NULL;

CREATE INDEX `SyncRun_ownerId_createdAt_idx` ON `SyncRun`(`ownerId`, `createdAt`);

ALTER TABLE `SyncRun`
  ADD CONSTRAINT `SyncRun_ownerId_fkey`
  FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
