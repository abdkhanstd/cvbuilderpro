/**
 * Utility functions for cropping and saving adjusted photos
 */

export interface PhotoCropData {
  zoom: number;
  x: number;
  y: number;
}

/**
 * Creates a canvas with the cropped/adjusted photo and returns a blob
 */
export async function createCroppedImageBlob(
  imageUrl: string,
  cropData: PhotoCropData,
  outputSize: number = 256
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, outputSize, outputSize);
        
        // Apply transformations
        ctx.save();
        
        // Move to center
        ctx.translate(outputSize / 2, outputSize / 2);
        
        // Apply zoom
        ctx.scale(cropData.zoom, cropData.zoom);
        
        // Apply position offset
        ctx.translate(cropData.x, cropData.y);
        
        // Draw image centered
        ctx.drawImage(
          img,
          -outputSize / 2 / cropData.zoom,
          -outputSize / 2 / cropData.zoom,
          outputSize / cropData.zoom,
          outputSize / cropData.zoom
        );
        
        ctx.restore();
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/jpeg', 0.95);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Uploads the cropped image and returns the new URL
 */
export async function uploadCroppedImage(
  cvId: string,
  imageBlob: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append('file', imageBlob, 'cropped-photo.jpg');
  formData.append('type', 'cropped-photo');

  const response = await fetch(`/api/cvs/${cvId}/upload-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload cropped image');
  }

  const data = await response.json();
  return data.url;
}
