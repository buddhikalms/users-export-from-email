ALTER TABLE `SyncRun`
  ADD COLUMN `jobId` VARCHAR(191) NULL,
  ADD COLUMN `currentFolder` TEXT NULL,
  ADD COLUMN `totalMessages` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `processedMessages` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `contactsFound` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `duplicatesRemoved` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `cancelRequested` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `finishedAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `SyncRun_jobId_key` ON `SyncRun`(`jobId`);
CREATE INDEX `SyncRun_jobId_idx` ON `SyncRun`(`jobId`);
