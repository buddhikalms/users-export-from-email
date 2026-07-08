-- Align the persisted billing tier with the public Business plan.
ALTER TABLE `Subscription`
MODIFY `plan` ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'AGENCY', 'BUSINESS', 'ENTERPRISE') NOT NULL DEFAULT 'FREE';

UPDATE `Subscription`
SET `plan` = 'BUSINESS'
WHERE `plan` = 'AGENCY';

ALTER TABLE `Subscription`
MODIFY `plan` ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE') NOT NULL DEFAULT 'FREE';
