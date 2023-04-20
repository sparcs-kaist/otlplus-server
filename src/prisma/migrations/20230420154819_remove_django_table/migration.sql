/*
  Warnings:

  - You are about to drop the `auth_group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_group_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_user_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_user_user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `django_admin_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `django_content_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `django_migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `django_session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `auth_group_permissions` DROP FOREIGN KEY `auth_group__permission_id_1f49ccbbdc69d2fc_fk_auth_permission_id`;

-- DropForeignKey
ALTER TABLE `auth_group_permissions` DROP FOREIGN KEY `auth_group_permission_group_id_689710a9a73b7457_fk_auth_group_id`;

-- DropForeignKey
ALTER TABLE `auth_permission` DROP FOREIGN KEY `auth__content_type_id_508cf46651277a81_fk_django_content_type_id`;

-- DropForeignKey
ALTER TABLE `auth_user_groups` DROP FOREIGN KEY `auth_user_groups_group_id_33ac548dcf5f8e37_fk_auth_group_id`;

-- DropForeignKey
ALTER TABLE `auth_user_groups` DROP FOREIGN KEY `auth_user_groups_user_id_4b5ed4ffdb8fd9b0_fk_auth_user_id`;

-- DropForeignKey
ALTER TABLE `auth_user_user_permissions` DROP FOREIGN KEY `auth_user_u_permission_id_384b62483d7071f0_fk_auth_permission_id`;

-- DropForeignKey
ALTER TABLE `auth_user_user_permissions` DROP FOREIGN KEY `auth_user_user_permissi_user_id_7f0938558328534a_fk_auth_user_id`;

-- DropForeignKey
ALTER TABLE `django_admin_log` DROP FOREIGN KEY `djang_content_type_id_697914295151027a_fk_django_content_type_id`;

-- DropForeignKey
ALTER TABLE `django_admin_log` DROP FOREIGN KEY `django_admin_log_user_id_52fdd58701c5f563_fk_auth_user_id`;

-- DropTable
DROP TABLE `auth_group`;

-- DropTable
DROP TABLE `auth_group_permissions`;

-- DropTable
DROP TABLE `auth_permission`;

-- DropTable
DROP TABLE `auth_user`;

-- DropTable
DROP TABLE `auth_user_groups`;

-- DropTable
DROP TABLE `auth_user_user_permissions`;

-- DropTable
DROP TABLE `django_admin_log`;

-- DropTable
DROP TABLE `django_content_type`;

-- DropTable
DROP TABLE `django_migrations`;

-- DropTable
DROP TABLE `django_session`;
