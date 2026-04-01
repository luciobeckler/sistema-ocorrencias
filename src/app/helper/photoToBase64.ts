import { Photo } from '@capacitor/camera';

export async function converterPhotoParaBase64(photo: Photo): Promise<string> {
  if (!photo.webPath) {
    throw new Error('O caminho da imagem (webPath) está indisponível.');
  }

  // Faz o fetch do arquivo local gerado pela câmera
  const response = await fetch(photo.webPath);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
