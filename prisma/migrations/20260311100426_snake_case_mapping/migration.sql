ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "RefreshToken" RENAME TO "refresh_tokens";

ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "refresh_tokens" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "refresh_tokens" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "refresh_tokens" RENAME COLUMN "revokedAt" TO "revoked_at";
ALTER TABLE "refresh_tokens" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "refresh_tokens" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER INDEX "User_pkey" RENAME TO "users_pkey";
ALTER INDEX "RefreshToken_pkey" RENAME TO "refresh_tokens_pkey";
ALTER INDEX "User_email_key" RENAME TO "users_email_key";
ALTER INDEX "RefreshToken_token_key" RENAME TO "refresh_tokens_token_key";
ALTER INDEX "RefreshToken_userId_idx" RENAME TO "refresh_tokens_user_id_idx";

ALTER TABLE "refresh_tokens" RENAME CONSTRAINT "RefreshToken_userId_fkey" TO "refresh_tokens_user_id_fkey";
