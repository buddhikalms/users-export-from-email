-- New organizations begin on the free plan.
ALTER TABLE `Organization` ALTER COLUMN `plan` SET DEFAULT 'free';

-- Existing users without a billing record are members of the free plan.
INSERT INTO `Subscription` (
    `id`,
    `userId`,
    `plan`,
    `interval`,
    `status`,
    `provider`,
    `createdAt`,
    `updatedAt`
)
SELECT
    UUID(),
    `User`.`id`,
    'FREE',
    'MONTHLY',
    'FREE',
    'paypal',
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
FROM `User`
LEFT JOIN `Subscription` ON `Subscription`.`userId` = `User`.`id`
WHERE `Subscription`.`id` IS NULL;
