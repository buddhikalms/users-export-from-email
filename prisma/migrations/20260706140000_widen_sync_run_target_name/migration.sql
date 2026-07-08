-- A mailbox sync stores all selected folder paths as its human-readable target.
-- Multiple nested folder names can legitimately exceed MySQL's default VARCHAR(191).
ALTER TABLE `SyncRun`
MODIFY `targetName` TEXT NULL;
