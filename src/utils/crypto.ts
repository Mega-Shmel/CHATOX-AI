/**
 * Cryptographic and device binding utilities for CHATOX AI.
 * Implements Web Crypto API AES-256-GCM, PBKDF2 key derivation,
 * and hardware volume ID fingerprinting.
 */

// Generates or retrieves hardware fingerprint
export async function getHardwareId(): Promise<string> {
  const nav = window.navigator;
  const screen = window.screen;
  const rawString = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    (nav as any).hardwareConcurrency || 4,
    (nav as any).deviceMemory || 8,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    'CHATOX_DEVICE_SALT_V1',
  ].join('###');

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Derive a 256-bit AES-GCM key using PBKDF2 from a password + hardwareId + salt
async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  hardwareId?: string
): Promise<CryptoKey> {
  const combinedSecret = `${passphrase}::${hardwareId || 'DEFAULT_HARDWARE_KEY'}::CHATOX_SALT`;
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(combinedSecret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext with AES-256-GCM
export async function encryptData(
  plaintext: string,
  password = 'DEFAULT_CHATOX_KEY',
  hardwareId?: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(password, salt, hardwareId);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const payload = {
      s: Array.from(salt),
      i: Array.from(iv),
      d: Array.from(new Uint8Array(encryptedBuffer)),
      h: hardwareId ? true : false,
    };

    return btoa(JSON.stringify(payload));
  } catch (error) {
    console.error('Encryption failed:', error);
    return plaintext;
  }
}

// Decrypt ciphertext with AES-256-GCM
export async function decryptData(
  encryptedBase64: string,
  password = 'DEFAULT_CHATOX_KEY',
  hardwareId?: string
): Promise<string | null> {
  if (!encryptedBase64) return null;
  const trimmed = encryptedBase64.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  try {
    const jsonStr = atob(trimmed);
    const payload = JSON.parse(jsonStr);
    if (!payload.s || !payload.i || !payload.d) {
      return null;
    }

    const salt = new Uint8Array(payload.s);
    const iv = new Uint8Array(payload.i);
    const encryptedData = new Uint8Array(payload.d);

    // Primary attempt according to payload.h flag
    const primaryHwId = payload.h ? hardwareId : undefined;
    try {
      const key = await deriveKey(password, salt, primaryHwId);
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (e1) {
      // Secondary attempt with alternative hardwareId derivation if primary failed
      const fallbackHwId = payload.h ? undefined : hardwareId;
      if (fallbackHwId !== primaryHwId) {
        try {
          const fallbackKey = await deriveKey(password, salt, fallbackHwId);
          const fallbackBuffer = await crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv: iv,
            },
            fallbackKey,
            encryptedData
          );
          const decoder = new TextDecoder();
          return decoder.decode(fallbackBuffer);
        } catch (e2) {
          // Both key attempts failed
        }
      }
      return null;
    }
  } catch (error) {
    console.warn('Decryption failed or invalid key format:', error);
    return null;
  }
}

// Hash password for secure local comparison
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`CHATOX_AUTH_SALT_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
