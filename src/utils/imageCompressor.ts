/**
 * High-Efficiency Client-Side Image Compressor
 *
 * Automatically downsizes and compresses photos before saving or transmitting.
 * Shrinks raw 12MP-48MP smartphone photos (4MB-15MB) down to crisp ~50KB-90KB JPEGs,
 * eliminating 98-99% of bandwidth and egress across Supabase, Webhooks, and Realtime.
 */

export interface CompressionOptions {
  maxDimension?: number; // Maximum width or height in pixels (default: 1024)
  quality?: number; // JPEG quality from 0 to 1 (default: 0.70)
  mimeType?: string; // Target mime type (default: 'image/jpeg')
}

export const compressImageFile = async (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxDimension = 1024,
    quality = 0.70,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // If SVG or non-image, fallback to direct data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const src = e.target?.result;
      if (typeof src !== 'string') {
        reject(new Error('Failed to read file as string'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to original string if image decoding fails
        resolve(src);
      };

      img.onload = () => {
        let { width, height } = img;

        // Downscale while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to optimized data URL
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
};
