DELETE rv
FROM
    review_reviewvote rv
    LEFT JOIN review_review r ON r.id = rv.review_id
WHERE
    r.id IS NULL;

-- AddForeignKey
ALTER TABLE `review_reviewvote` ADD CONSTRAINT `review_reviewvote_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `review_review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_reviewvote` ADD CONSTRAINT `review_reviewvote_userprofile_id_fkey` FOREIGN KEY (`userprofile_id`) REFERENCES `session_userprofile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
