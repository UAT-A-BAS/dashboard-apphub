import { describe, expect, it } from 'vitest';
// The runtime module lives under functions/ so Pages Functions can import it.
// It is plain ESM with no Cloudflare-only globals at module scope, so it can be
// exercised directly here.
import {
  appContentSecurityPolicy,
  isLikelyHtml,
  normalizeAppName,
  slugifyName,
  uniqueAppId,
  utf8ByteLength,
} from '../../functions/_lib/appHtml.js';

describe('slugifyName', () => {
  it('produces a URL-safe id', () => {
    expect(slugifyName('Kalkulator Cuti')).toBe('kalkulator-cuti');
    expect(slugifyName('  Laporan 2026!! ')).toBe('laporan-2026');
  });

  it('returns an empty string when nothing usable remains', () => {
    expect(slugifyName('!!!')).toBe('');
    expect(slugifyName('')).toBe('');
  });
});

describe('uniqueAppId', () => {
  it('uses the plain slug when free', () => {
    expect(uniqueAppId('Kalkulator', [])).toBe('kalkulator');
  });

  it('appends a suffix when the slug is taken', () => {
    expect(uniqueAppId('Kalkulator', ['kalkulator'])).toBe('kalkulator-2');
    expect(uniqueAppId('Kalkulator', ['kalkulator', 'kalkulator-2'])).toBe('kalkulator-3');
  });

  it('falls back to the provided random id when the name is unusable', () => {
    expect(uniqueAppId('!!!', [], () => 'abcd1234')).toBe('abcd1234');
  });
});

describe('normalizeAppName', () => {
  it('trims and caps the display name', () => {
    expect(normalizeAppName('  Cuti  ')).toBe('Cuti');
    expect(normalizeAppName('x'.repeat(200))).toHaveLength(60);
  });
});

describe('isLikelyHtml', () => {
  it('accepts real HTML documents', () => {
    expect(isLikelyHtml('<!doctype html><html><body>hi</body></html>')).toBe(true);
    expect(isLikelyHtml('<div><script>1</script></div>')).toBe(true);
  });

  it('rejects content that is not HTML', () => {
    expect(isLikelyHtml('{"a":1}')).toBe(false);
    expect(isLikelyHtml('plain text only')).toBe(false);
  });
});

describe('utf8ByteLength', () => {
  it('counts multi-byte characters by their encoded size', () => {
    expect(utf8ByteLength('abc')).toBe(3);
    expect(utf8ByteLength('cafe\u0301')).toBe(6);
  });
});

describe('appContentSecurityPolicy', () => {
  it('sandboxes uploaded apps and blocks same-origin access', () => {
    const policy = appContentSecurityPolicy();
    expect(policy).toContain('sandbox');
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain('allow-same-origin');
  });
});
