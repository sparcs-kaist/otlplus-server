-- AlterTable
ALTER TABLE `paper` MODIFY `title` VARCHAR(300) NULL,
    MODIFY `abstract` TEXT NULL,
    MODIFY `keywords` TEXT NULL,
    MODIFY `category` VARCHAR(100) NULL,
    MODIFY `doi` VARCHAR(100) NULL,
    MODIFY `pdf_link` VARCHAR(255) NULL,
    MODIFY `xml_link` VARCHAR(255) NULL,
    MODIFY `url` VARCHAR(255) NULL;
