import { Request } from 'express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: memoryStorage(),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = [
      // Imágenes
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',

      // PDF
      'application/pdf',

      // Word
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx

      // Excel
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx

      // PowerPoint
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          `Tipo de archivo no permitido: ${file.mimetype}`,
        ),
        false,
      );
    }
  },

  limits: {
    fileSize: 50 * 1024 * 1024,
  },
};
