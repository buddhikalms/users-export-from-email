-- A contact can be discovered in many nested folders, which are retained as
-- a comma-separated source list. Error messages may also include provider
-- context longer than MySQL's default VARCHAR(191).
ALTER TABLE `Contact`
MODIFY `sourceFolder` TEXT NULL;

ALTER TABLE `SyncRun`
MODIFY `errorMessage` TEXT NULL;

ALTER TABLE `ExportRun`
MODIFY `errorMessage` TEXT NULL;
