/**
 * Email Validation Utility
 * ──────────────────────
 * Multi-layer email validation for Kajubadam Vocabulary.
 *
 * Checks performed:
 *   1. Format validation (RFC 5322 simplified)
 *   2. Domain has valid MX records (via DNS lookup)
 *   3. Block known disposable/temporary email domains
 *
 * Usage in API routes:
 *   import { validateEmail, EmailValidationError } from "@/lib/email-validator";
 *   const result = await validateEmail(userEmail);
 *   if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });
 */

import { promises as dns } from "node:dns";

// ── Known disposable email domains (curated blocklist) ──
const DISPOSABLE_DOMAINS = new Set([
  // Temporary / throwaway email providers
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.org",
  "guerrillamail.net",
  "guerrillamail.biz",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "tempmail.com",
  "tempmail.net",
  "tempmail.org",
  "temp-mail.org",
  "throwaway.email",
  "throwawaymail.com",
  "throwawaymail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "sharklasers.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.org",
  "trashmail.ws",
  "maildrop.cc",
  "getairmail.com",
  "getnada.com",
  "nada.email",
  "tempinbox.com",
  "emailondeck.com",
  "mailexpire.com",
  "mailcatch.com",
  "dispostable.com",
  "mailnesia.com",
  "tempinbox.net",
  "emailtemporario.com.br",
  "mytemp.email",
  "tempr.email",
  "fakemail.net",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "mailmetrash.com",
  "thankyou2010.com",
  "trash2009.com",
  "mt2009.com",
  "trashymail.com",
  "tyldd.com",
  "rppkn.com",
  "s0ny.net",
  "bwz0di0d.com",
  "drdrb.net",
  "dsiay.com",
  "edv.to",
  "emltmp.com",
  "fammix.com",
  "fdfdsfds.com",
  "flashbox.5july.org",
  "fmguy.com",
  "gmx.us",
  "j3rqt89ez.com",
  "jajxz.com",
  "mfsa.info",
  "moakt.com",
  "moakt.ws",
  "moneypipe.net",
  "mt2009.com",
  "muuyharold.com",
  "mymail-in.net",
  "nepwk.com",
  "nomail.xl.cx",
  "nomail2me.com",
  "nospam4.us",
  "nowhere.org",
  "online.ms",
  "oopi.org",
  "pookmail.com",
  "proxymail.eu",
  "prtnx.com",
  "punkass.com",
  "qa.team",
  "rcpt.at",
  "recode.me",
  "recursor.net",
  "safetymail.info",
  "safetypost.de",
  "sendfree.org",
  "sendspam.org",
  "shitmail.de",
  "shitmail.org",
  "slopsbox.com",
  "sneakemail.com",
  "sogetthis.com",
  "sohus.cn",
  "spam.la",
  "spam4.me",
  "spamail.de",
  "spamarrest.com",
  "spamcon.org",
  "spamcowboy.com",
  "spamcowboy.net",
  "spamcowboy.org",
  "spamex.com",
  "spamfree24.org",
  "spamfree24.com",
  "spamfree24.net",
  "spamgoes.in",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "spamherelots.com",
  "spamhole.com",
  "spaminator.de",
  "spamkill.info",
  "spaml.com",
  "spamlot.net",
  "spamoff.xyz",
  "spamoutsourcing.com",
  "spamslicer.com",
  "spamstack.net",
  "spamthis.co.uk",
  "spamtrail.com",
  "spamtrap.net",
  "spamwc.de",
  "speed.1s.fr",
  "spoofmail.de",
  "stuffmail.de",
  "suremail.info",
  "temp-emails.com",
  "temp-mail.com",
  "temp-mail.org",
  "temp-mail.ru",
  "tempemail.biz",
  "tempemail.co.za",
  "tempemail.com",
  "tempemail.net",
  "tempinbox.co.za",
  "tempinbox.com",
  "tempmail.it",
  "tempmail.us",
  "tempmail2.com",
  "tempmaildemo.com",
  "tempmailer.com",
  "tempmailer.de",
  "temporaryemail.net",
  "temporaryemail.us",
  "temporaryforwarding.com",
  "temporaryinbox.com",
  "thejokinghazard.net",
  "thisisnotmyrealemail.com",
  "trash-amil.com",
  "trash2009.com",
  "trashdevil.com",
  "trashdevil.de",
  "trashemail.de",
  "trashmail.at",
  "trashmail.com",
  "trashmail.de",
  "trashmail.me",
  "trashmail.net",
  "trashmail.org",
  "trashmail.ws",
  "trashmailer.com",
  "trashymail.com",
  "trbvm.com",
  "trialmail.de",
  "tryalert.com",
  "tyldd.com",
  "uggsrock.com",
  "unkn0wn.xyz",
  "unmail.ru",
  "upliftnow.com",
  "uplipht.com",
  "veryrealemail.com",
  "vizslafdu.com",
  "vmail.me",
  "vsimcard.com",
  "vubby.com",
  "walala.org",
  "walkmail.net",
  "walkmail.ru",
  "webemail.me",
  "webm4il.in",
  "wegwerfemail.de",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "wh4f.org",
  "whyspam.me",
  "willhackforfood.biz",
  "winemaven.info",
  "wmvirtual.net",
  "xagloo.com",
  "xcompress.com",
  "xkx.me",
  "xoxy.net",
  "xwaretech.com",
  "xwaretech.info",
  "xwaretech.net",
  "xww.ro",
  "yep.it",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "yopmail.org",
  "ypmail.webarnak.com",
  "yuurok.com",
  "zehnminutenmail.de",
  "zippymail.info",
  "zoaxe.com",
  "zoemail.org",
  "zzz.com",
  "zzz.com",

  // Common typos / fake domains often used in fraudulent purchases
  "mailnator.com",
  "malinator.com",
  "guerrillamail.eu",
  "tempmail.co",
  "yopmail.co.uk",
  "10minutemail.co.uk",
  "trashmail.io",
]);

// ── Simplified RFC 5322 email regex ──
// Allows most common email formats, blocks obviously invalid ones
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// ── TLD must be at least 2 chars ──
const TLD_REGEX = /\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  /** Normalized email (lowercased, trimmed) */
  normalizedEmail?: string;
  /** The email domain */
  domain?: string;
}

export type EmailValidationError =
  | "invalid_format"
  | "missing_at_symbol"
  | "invalid_domain_format"
  | "disposable_email_not_allowed"
  | "domain_has_no_mx_records"
  | "dns_lookup_failed";

/**
 * Validate an email address with multiple layers of checks.
 *
 * @param email - The raw email input from user
 * @param options - Optional settings
 * @param options.checkMX - Whether to perform DNS MX lookup (default: true)
 * @param options.checkDisposable - Whether to check disposable domain list (default: true)
 */
export async function validateEmail(
  email: string,
  options: { checkMX?: boolean; checkDisposable?: boolean } = {}
): Promise<EmailValidationResult> {
  const { checkMX = true, checkDisposable = true } = options;

  // 1. Basic existence check
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail.length < 3 || normalizedEmail.length > 254) {
    return { valid: false, error: "Email must be between 3 and 254 characters" };
  }

  // 2. Contains @ symbol
  if (!normalizedEmail.includes("@")) {
    return { valid: false, error: "Email must contain @" };
  }

  const parts = normalizedEmail.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: "Invalid email format" };
  }

  const domain = parts[1];

  // 3. Regex format check
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { valid: false, error: "Invalid email format" };
  }

  // 4. TLD must exist (at least 2 chars after last dot)
  if (!TLD_REGEX.test(domain)) {
    return { valid: false, error: "Invalid email domain" };
  }

  // 5. Domain length check
  if (domain.length > 253) {
    return { valid: false, error: "Email domain is too long" };
  }

  // 6. Block disposable email domains
  if (checkDisposable && DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "Temporary/disposable email addresses are not allowed. Please use a permanent email.",
      domain,
    };
  }

  // 7. DNS MX record lookup
  if (checkMX) {
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return {
          valid: false,
          error: "This email domain cannot receive emails. Please check your email address.",
          domain,
        };
      }
    } catch (dnsError: any) {
      // NXDOMAIN or other DNS errors
      if (dnsError.code === "ENOTFOUND" || dnsError.code === "ENODATA") {
        return {
          valid: false,
          error: "This email domain does not exist. Please check your email address.",
          domain,
        };
      }

      // DNS lookup failed for another reason — log and proceed
      // In development, we're lenient about DNS failures
      if (process.env.NODE_ENV === "production") {
        return {
          valid: false,
          error: "Unable to verify email domain. Please try again later.",
          domain,
        };
      }
    }
  }

  return { valid: true, normalizedEmail, domain };
}

/**
 * Synchronous lightweight email format check (no DNS, no disposable check).
 * Use this for quick client-side validation.
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 254) return false;
  if (!normalized.includes("@")) return false;
  const parts = normalized.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  if (!EMAIL_REGEX.test(normalized)) return false;
  if (!TLD_REGEX.test(parts[1])) return false;
  return true;
}

/**
 * Check if a domain is a known disposable email provider.
 * Synchronous — uses the blocklist only (no DNS).
 */
export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase().trim());
}

/**
 * Get the list of disposable domains (for debugging/display).
 */
export function getDisposableDomains(): string[] {
  return Array.from(DISPOSABLE_DOMAINS).sort();
}
