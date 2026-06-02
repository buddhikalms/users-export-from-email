CREATE TABLE `EncryptedVault` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `encryptedBlob` LONGTEXT NOT NULL,
    `salt` VARCHAR(191) NOT NULL,
    `iv` VARCHAR(191) NOT NULL,
    `kdf` VARCHAR(191) NOT NULL DEFAULT 'PBKDF2',
    `iterations` INTEGER NOT NULL DEFAULT 250000,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EncryptedVault_userId_idx`(`userId`),
    UNIQUE INDEX `EncryptedVault_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EncryptedVault` ADD CONSTRAINT `EncryptedVault_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
