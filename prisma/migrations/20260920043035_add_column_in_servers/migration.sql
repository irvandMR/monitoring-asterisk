/*
  Warnings:

  - You are about to drop the column `role` on the `servers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "servers" DROP COLUMN "role",
ADD COLUMN     "amiPassword" TEXT,
ADD COLUMN     "amiUsername" TEXT,
ADD COLUMN     "sshKey" TEXT,
ADD COLUMN     "sshPassword" TEXT,
ADD COLUMN     "sshUsername" TEXT;

-- DropEnum
DROP TYPE "ServerRole";
