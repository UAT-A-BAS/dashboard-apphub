import { describe, expect, it } from 'vitest';
import { isLocalHostTarget, normalizeUrl } from './shortcuts';

describe('isLocalHostTarget', () => {
  it('recognises loopback, private network, and .local names', () => {
    for (const target of [
      'http://localhost:8080/index.html',
      'localhost:8080/index.html',
      'http://127.0.0.1:5500/app.html',
      '127.0.0.1:5500',
      'http://192.168.1.20:3000/',
      'http://10.0.0.5/tool.html',
      'http://172.16.4.9/',
      'http://my-laptop.local:9000/',
      'http://[::1]:8080/',
    ]) {
      expect(isLocalHostTarget(target), target).toBe(true);
    }
  });

  it('leaves public hosts and non-addresses alone', () => {
    for (const target of [
      'https://generate-mom.pages.dev/',
      'http://172.32.0.1/',
      'https://notlocal.com',
      'https://my-laptop.local.com/',
      '',
    ]) {
      expect(isLocalHostTarget(target), target).toBe(false);
    }
  });
});

describe('normalizeUrl', () => {
  it('keeps http and https URLs as typed', () => {
    expect(normalizeUrl('https://example.com/a.html')).toBe('https://example.com/a.html');
    expect(normalizeUrl('http://example.com/a.html')).toBe('http://example.com/a.html');
  });

  it('adds http for local targets, with or without a typed scheme', () => {
    expect(normalizeUrl('localhost:8080/index.html')).toBe('http://localhost:8080/index.html');
    expect(normalizeUrl('127.0.0.1:5500/app.html')).toBe('http://127.0.0.1:5500/app.html');
    expect(normalizeUrl('  http://localhost:8080/index.html  ')).toBe('http://localhost:8080/index.html');
  });

  it('downgrades https on a local target because the local server has no trusted certificate', () => {
    expect(normalizeUrl('https://localhost:8099/index.html')).toBe('http://localhost:8099/index.html');
  });

  it('still assumes https for public hosts typed without a scheme', () => {
    expect(normalizeUrl('generate-memo.pages.dev')).toBe('https://generate-memo.pages.dev');
    expect(normalizeUrl('bca.co.id/path')).toBe('https://bca.co.id/path');
  });

  it('preserves file and protocol-relative URLs instead of prefixing them', () => {
    expect(normalizeUrl('file:///tmp/tool/index.html')).toBe('file:///tmp/tool/index.html');
    expect(normalizeUrl('//cdn.example.com/tool.html')).toBe('//cdn.example.com/tool.html');
  });

  it('falls back to example.com when the value is blank', () => {
    expect(normalizeUrl('   ')).toBe('https://example.com');
  });
});
