import sharp from 'sharp';
import path from 'path';

export interface WatermarkOptions {
  quality: 'low' | 'medium' | 'high' | 'original';
  studioName: string;
}

const qualitySettings = {
  low: { width: 800, quality: 60 },
  medium: { width: 1920, quality: 75 },
  high: { width: 3840, quality: 85 },
  original: { width: null, quality: 90 }
};

export async function addWatermarkAndResize(
  inputPath: string,
  outputPath: string,
  options: WatermarkOptions
): Promise<void> {
  const settings = qualitySettings[options.quality];

  let image = sharp(inputPath);

  // Get image metadata
  const metadata = await image.metadata();

  // Resize if needed
  if (settings.width && metadata.width && metadata.width > settings.width) {
    image = image.resize(settings.width, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Create watermark text as SVG
  const watermarkText = options.studioName;
  const fontSize = settings.width ? Math.floor(settings.width / 20) : 60;

  const svgWatermark = Buffer.from(`
    <svg width="${settings.width || metadata.width}" height="${Math.floor(fontSize * 1.5)}">
      <style>
        .watermark {
          fill: white;
          font-size: ${fontSize}px;
          font-family: Arial, sans-serif;
          font-weight: bold;
          opacity: 0.5;
        }
      </style>
      <text x="50%" y="50%" text-anchor="middle" class="watermark">${watermarkText}</text>
    </svg>
  `);

  // Composite watermark onto image
  await image
    .composite([
      {
        input: svgWatermark,
        gravity: 'center'
      }
    ])
    .jpeg({ quality: settings.quality })
    .toFile(outputPath);
}
