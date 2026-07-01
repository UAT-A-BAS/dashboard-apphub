import { describe, expect, it, vi } from 'vitest';
import { compressIcon, type ImageCompressionAdapter } from './imageCompression';

function adapterFor(outputs: Record<number, string>): ImageCompressionAdapter {
  return {
    load: vi.fn().mockResolvedValue({ width: 1200, height: 600, source: {} }),
    render: vi.fn(async (_image, width, height, quality) => ({
      dataUrl: outputs[Math.round(quality * 100)] ?? 'data:image/webp;base64,small',
      width,
      height,
    })),
  };
}

describe('compressIcon', () => {
  it('resizes an icon to fit within 256x256 without changing its aspect ratio', async () => {
    const adapter = adapterFor({ 82: 'data:image/webp;base64,small' });

    const result = await compressIcon(new File(['large'], 'icon.png', { type: 'image/png' }), adapter, {
      maxDataUrlLength: 100,
    });

    expect(adapter.render).toHaveBeenCalledWith(expect.anything(), 256, 128, 0.82);
    expect(result.width).toBe(256);
    expect(result.height).toBe(128);
  });

  it('lowers quality until the encoded icon fits the payload budget', async () => {
    const adapter = adapterFor({
      82: `data:image/webp;base64,${'x'.repeat(100)}`,
      70: `data:image/webp;base64,${'x'.repeat(90)}`,
      58: 'data:image/webp;base64,small',
    });

    const result = await compressIcon(new File(['large'], 'icon.png', { type: 'image/png' }), adapter, {
      maxDataUrlLength: 80,
    });

    expect(adapter.render).toHaveBeenCalledTimes(3);
    expect(result.quality).toBe(0.58);
    expect(result.dataUrl.length).toBeLessThanOrEqual(80);
  });

  it('rejects files that are not images', async () => {
    await expect(compressIcon(new File(['text'], 'notes.txt', { type: 'text/plain' }), adapterFor({}))).rejects.toThrow(
      'File icon harus berupa gambar.',
    );
  });
});
