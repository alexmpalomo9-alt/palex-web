import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {

  constructor(private storage: Storage) {}

  async uploadImage(file: File, path: string): Promise<string> {
    if (!file) throw new Error('No file provided');

    const compressed = await this.compressImage(file, 0.7); // calidad 70%

    const fileRef = ref(this.storage, path);
    await uploadBytes(fileRef, compressed);
    return await getDownloadURL(fileRef);
  }

  private async compressImage(file: File, quality = 0.7): Promise<Blob> {
    const imageBitmap = await createImageBitmap(file);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Redimensiona si es demasiado grande (opcional)
    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / imageBitmap.width);

    canvas.width = imageBitmap.width * scale;
    canvas.height = imageBitmap.height * scale;

    ctx!.drawImage(
      imageBitmap,
      0, 0,
      canvas.width,
      canvas.height
    );

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        quality
      );
    });
  }
}
