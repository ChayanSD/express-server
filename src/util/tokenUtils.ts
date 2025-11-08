import redis from "../lib/redis";

const REFRESH_KEY_PREFIX = "refresh:";
const USER_TOKENS_PREFIX = "user_tokens:";

export async function storeRefreshJti(jti: string, userId: string, ttlSeconds: number) {
  // Store the jti with userId and TTL
  await redis.set(REFRESH_KEY_PREFIX + jti, userId, { EX: ttlSeconds });
  // Add jti to user's set
  await redis.sAdd(USER_TOKENS_PREFIX + userId, jti);
}

export async function revokeRefreshJti(jti: string) {
  // Get userId from the key
  const userId = await redis.get(REFRESH_KEY_PREFIX + jti);
  if (userId) {
    // Remove from user's set
    await redis.sRem(USER_TOKENS_PREFIX + userId, jti);
  }
  // Delete the jti key
  await redis.del(REFRESH_KEY_PREFIX + jti);
}

export async function revokeAllUserRefreshTokens(userId: string) {
  // Get all jti for user
  const jtis = await redis.sMembers(USER_TOKENS_PREFIX + userId);
  if (jtis.length > 0) {
    // Delete all jti keys
    const keys = jtis.map(jti => REFRESH_KEY_PREFIX + jti);
    await redis.del(keys);
    // Clear the set
    await redis.del(USER_TOKENS_PREFIX + userId);
  }
}
