-- CreateIndex
CREATE INDEX `review_humanitybestreview_review_id_idx` ON `review_humanitybestreview`(`review_id`);

-- CreateIndex
CREATE INDEX `review_majorbestreview_review_id_idx` ON `review_majorbestreview`(`review_id`);

-- AddForeignKey
ALTER TABLE `review_humanitybestreview` ADD CONSTRAINT `review_humanitybestreview_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `review_review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_majorbestreview` ADD CONSTRAINT `review_majorbestreview_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `review_review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
