export const ICON_MAX_DIMENSION = 256;
export const ICON_MAX_DATA_URL_LENGTH = 180_000;

type LoadedImage = { width: number; height: number; source: CanvasImageSource };
type RenderedImage = { dataUrl: string; width: number; height: number };

export type ImageCompressionAdapter = {
  load(file: File): Promise<LoadedImage>;
  render(image: LoadedImage, width: number, height: number, quality: number): Promise<RenderedImage>;
};

const browserAdapter: ImageCompressionAdapter = {
  async load(file) {
    const bitmap = await createImageBitmap(file);
    return { width: bitmap.width, height: bitmap.height, source: bitmap };
  },
  async render(image, width, height, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browser tidak dapat memproses icon ini.');
    context.clearRect(0, 0, width, height);
    context.drawImage(image.source, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL('image/webp', quality), width, height };
  },
};

export async function compressIcon(
  file: File,
  adapter: ImageCompressionAdapter = browserAdapter,
  options: { maxDimension?: number; maxDataUrlLength?: number } = {},
) {
  if (!file.type.startsWith('image/')) throw new Error('File icon harus berupa gambar.');

  const maxDimension = options.maxDimension ?? ICON_MAX_DIMENSION;
  const maxDataUrlLength = options.maxDataUrlLength ?? ICON_MAX_DATA_URL_LENGTH;
  const image = await adapter.load(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  for (const quality of [0.82, 0.7, 0.58, 0.46, 0.34]) {
    const rendered = await adapter.render(image, width, height, quality);
    if (rendered.dataUrl.length <= maxDataUrlLength) return { ...rendered, quality };
  }

  throw new Error('Icon tetap terlalu besar setelah dikompres. Pilih gambar yang lebih sederhana.');
}
