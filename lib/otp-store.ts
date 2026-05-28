/**
 * OTP Store — Shared in-memory storage for OTP codes and cooldown tracking.
 *
 * Both send-otp and verify-otp routes use this module so they share
 * the same in-memory Map (process-wide singleton).
 */
export interface OtpEntry {
  otp: string;
  expiresAt: number;
}

// ── Process-global stores ──
const otpStore = new Map<string, OtpEntry>();

/** Store an OTP for an email. */
export function setOtp(email: string, otp: string, ttlMs: number): void {
  otpStore.set(email, { otp, expiresAt: Date.now() + ttlMs });
}

/** Retrieve and delete an OTP (single-use). Returns undefined if missing/expired. */
export function consumeOtp(email: string): OtpEntry | undefined {
  const entry = otpStore.get(email);
  if (entry) otpStore.delete(email);
  return entry;
}

/** Peek at an OTP without consuming it. */
export function peekOtp(email: string): OtpEntry | undefined {
  return otpStore.get(email);
}

/** Delete an OTP (e.g., after failed send). */
export function deleteOtp(email: string): void {
  otpStore.delete(email);
}

/** Remove all expired OTP entries. */
export function cleanupOtps(): number {
  const now = Date.now();
  let removed = 0;
  for (const [key, entry] of otpStore) {
    if (now > entry.expiresAt) {
      otpStore.delete(key);
      removed++;
    }
  }
  return removed;
}

// ── Cooldown stores (email + IP) ──
const emailCooldown = new Map<string, number>();
const ipCooldown = new Map<string, number>();

export function setEmailCooldown(email: string, timestamp: number): void {
  emailCooldown.set(email, timestamp);
}

export function setIpCooldown(ip: string, timestamp: number): void {
  ipCooldown.set(ip, timestamp);
}

export function getEmailCooldown(email: string): number | undefined {
  return emailCooldown.get(email);
}

export function getIpCooldown(ip: string): number | undefined {
  return ipCooldown.get(ip);
}

/** Remove cooldowns older than 2× the given durations. */
export function cleanupCooldowns(emailTtl: number, ipTtl: number): void {
  const now = Date.now();
  for (const [key, ts] of emailCooldown) {
    if (now - ts > emailTtl * 2) emailCooldown.delete(key);
  }
  for (const [key, ts] of ipCooldown) {
    if (now - ts > ipTtl * 2) ipCooldown.delete(key);
  }
}
