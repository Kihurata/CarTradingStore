// src/utils/s3Client.ts

export const uploadImageToS3 = async (file: Express.Multer.File): Promise<string> => {
  return `https://fake-s3-url.com/${Date.now()}_${file.originalname}`;
};

export const deleteImageFromS3 = async (imageUrl: string): Promise<boolean> => {
  return true;
};