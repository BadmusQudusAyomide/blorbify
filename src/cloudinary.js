const CLOUDINARY_CLOUD_NAME = 'dwshyzftx';
const CLOUDINARY_UPLOAD_PRESET = 'blorbmart';
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export function validateImage(file, label = 'Image') {
  if (!file) {
    return `Please choose a ${label.toLowerCase()}.`;
  }

  if (!file.type?.startsWith('image/')) {
    return `${label} must be a JPG, PNG, WEBP, or another image file.`;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return `${label} must be 8MB or smaller.`;
  }

  return '';
}

export function validateProductImage(file) {
  return validateImage(file, 'Product image');
}

export async function uploadImage(file, folder = 'blorbify/images', onProgress, label = 'Image') {
  const validationError = validateImage(file, label);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      const result = JSON.parse(request.responseText || 'null');

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(result?.error?.message || 'Image upload failed. Please try again.'));
        return;
      }

      if (typeof onProgress === 'function') {
        onProgress(100);
      }

      resolve({
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
    };

    request.onerror = () => reject(new Error('Image upload failed. Please check your connection and try again.'));
    request.send(formData);
  });
}

export function uploadProductImage(file, folder = 'blorbify/products', onProgress) {
  return uploadImage(file, folder, onProgress, 'Product image');
}

export function validateStoreLogo(file) {
  return validateImage(file, 'Store logo');
}

export function uploadStoreLogo(file, folder = 'blorbify/logos', onProgress) {
  return uploadImage(file, folder, onProgress, 'Store logo');
}

export function validateStoreBanner(file) {
  return validateImage(file, 'Store banner');
}

export function uploadStoreBanner(file, folder = 'blorbify/banners', onProgress) {
  return uploadImage(file, folder, onProgress, 'Store banner');
}
