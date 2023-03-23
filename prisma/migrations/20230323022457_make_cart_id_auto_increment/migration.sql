DROP TABLE `CartItem`;

-- AlterTable
ALTER TABLE `Cart` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- CreateTable
CREATE TABLE `CartItem` (
    `slug` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `cartId` INTEGER NOT NULL,

    PRIMARY KEY (`name`, `cartId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
