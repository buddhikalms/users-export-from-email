ALTER TABLE `ExportRun` ADD COLUMN `ownerId` VARCHAR(191) NULL;

CREATE INDEX `ExportRun_ownerId_createdAt_idx` ON `ExportRun`(`ownerId`, `createdAt`);

ALTER TABLE `ExportRun`
  ADD CONSTRAINT `ExportRun_ownerId_fkey`
  FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ExportRun`
  MODIFY `format` ENUM('EXCEL', 'CSV', 'JSON', 'GOOGLE_SHEETS') NOT NULL;
