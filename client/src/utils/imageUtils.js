/**
 * Utility function to get cropped image from canvas
 */
export const getCroppedImg = (image, crop, fileName, scale = 1, rotate = 0) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and disk space.
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-crop.x * scaleX, -crop.y * scaleY);
  // 2) Move the origin to the center of the image
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate((rotate * Math.PI) / 180);
  // 4) Scale around the origin
  ctx.scale(scale, scale);
  // 5) Move the origin back to (0,0)
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      blob.name = fileName;
      resolve(blob);
    }, 'image/jpeg');
  });
};
