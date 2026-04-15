import { Readable } from 'stream';
import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
  UploadApiErrorResponse,
} from 'cloudinary';
import { envs } from 'src/config';
import {
  TResponse,
  TCloudinaryResource,
  TFileResponse,
  TCloudinaryResponse,
} from '../types';

// interface IFileResponse {
//   public_id: string;
//   url: string;
//   width?: number;
//   height?: number;
//   format?: string;
//   resource_type: string;
//   bytes: number;
//   created_at: string;
//   type: string;
// }

@Injectable()
export class CloudinaryService {
  private MAX_RESULTS: number = 100;

  constructor() {
    cloudinary.config({
      cloud_name: envs.cloudinaryCloudName,
      api_key: envs.cloudinaryApiKey,
      api_secret: envs.cloudinaryApiSecret,
    });
  }

  async handleFileUpload(
    file: Express.Multer.File,
    code: string,
    subject: string,
  ): Promise<TResponse> {
    try {
      if (!file)
        throw new BadRequestException('No se proporcionó ningun archivo');

      const uploadResult = (await this.uploadFile(
        file.buffer,
        code,
        subject,
        file.originalname,
        file.mimetype,
      )) as UploadApiResponse;

      return {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        type: uploadResult.resource_type === 'image' ? 'image' : 'document',
      };
    } catch (error) {
      if (error.message.includes('File size too large')) {
        throw new PayloadTooLargeException(
          'El archivo excede el tamaño máximo permitido de 10MB',
        );
      }

      throw new BadRequestException(`Error al subir archivo: ${error.message}`);
    }
  }

  private getResourceType(mimetype: string): 'image' | 'raw' {
    if (mimetype.startsWith('image/')) {
      return 'image';
    } else {
      return 'raw'; // documentos
    }
  }

  async testConnection() {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 1,
      });

      return {
        status: 'success',
        message: 'Conexión exitosa',
        totalResources: result.total_count,
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    code: string,
    subject: string,
    filename: string,
    mimetype: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!code || !subject)
      throw new BadRequestException(
        'Revise el <code> o <subject> estos no pueden estar vacíos.',
      );

    const timestamp = Date.now();
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    const extension = filename.split('.').pop();
    const fileName = `${nameWithoutExt}-${timestamp}`;
    const resourceType = this.getResourceType(mimetype);
    const folder = `SPI/${code}/${subject}`;

    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        folder: folder,
        public_id: fileName,
        resource_type: resourceType,
        overwrite: false,
        use_filename: false,
        unique_filename: false,
        invalidate: true,
      };

      if (resourceType === 'raw') {
        uploadOptions.format = extension;
      }

      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(
                `Error al subir archivo: ${error.message}`,
              ),
            );
          }

          if (!result) {
            return reject(
              new BadRequestException('No se recibió resultado de Cloudinary'),
            );
          }

          resolve(result);
        },
      );

      Readable.from(fileBuffer).pipe(stream);
    });
  }

  async getFilesByFolder(code: string, subject: string) {
    try {
      const folderPath = `SPI/${code}/${subject}`;
      const [images, documents] = await Promise.all([
        this.getImages(folderPath),
        this.getFiles(folderPath),
      ]);

      const allFiles = [
        ...images.resources.map((resource) => ({
          ...this.formatFileResponse(resource),
          type: 'image',
        })),
        ...documents.resources.map((resource) => ({
          ...this.formatFileResponse(resource),
          type: 'document',
        })),
      ];

      if (allFiles.length === 0) {
        throw new BadRequestException(
          'No se encontraron archivos en el directorio especificado',
        );
      }

      return allFiles.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener archivos: ${error.message}`,
      );
    }
  }

  async searchFilesByUserAndTerm(code: string, searchTerm: string) {
    try {
      const [images, documents] = await Promise.all([
        this.getImages(code, 500),
        this.getFiles(code, 500),
      ]);

      const filteredImages = images.resources.filter((resource) =>
        resource.public_id.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      const filteredDocuments = documents.resources.filter((resource) =>
        resource.public_id.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      const allFiles = [
        ...filteredImages.map((resource) => ({
          ...this.formatFileResponse(resource),
          type: 'image',
        })),
        ...filteredDocuments.map((resource) => ({
          ...this.formatFileResponse(resource),
          type: 'document',
        })),
      ];

      if (allFiles.length === 0) {
        throw new BadRequestException(
          'No se encontraron archivos con el término indicado',
        );
      }

      return allFiles.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } catch (error) {
      throw new BadRequestException(
        `Error en la busqueda por usuario y archivo: ${error.message}`,
      );
    }
  }

  // Remove
  async remove(public_id: string) {
    try {
      const res = (await cloudinary.uploader.destroy(
        public_id,
        this.optionsDeleteFile([public_id]),
      )) as {
        result: string;
      };

      if (!res)
        throw new BadRequestException(
          `Error al eliminar el archivo, no se recibió ninguna respuesta del servicio.`,
        );

      if (res.result !== 'ok') throw new Error(res.result);

      return res;
    } catch (error) {
      throw new BadRequestException(
        `Error al eliminar el archivo: <${error as string}>`,
      );
    }
  }

  async removeMultiple(public_ids: string[]) {
    try {
      const res = (await cloudinary.api.delete_resources(
        public_ids,
        this.optionsDeleteFile(public_ids),
      )) as {
        deleted: Record<string, string>;
      };

      if (!res || !res.deleted) {
        throw new BadRequestException(
          `Error al eliminar los archivos, no se recibió ninguna respuesta válida del servicio.`,
        );
      }

      const errores = Object.entries(res.deleted).filter(
        ([_, status]) => status !== 'deleted',
      );

      if (errores.length > 0) {
        const details = errores
          .map(([id, status]) => `${id}: ${status}`)
          .join(', ');
        throw new BadRequestException(
          `Error al eliminar los siguientes archivos: ${details}`,
        );
      }

      return res;
    } catch (error) {
      throw new BadRequestException(
        `Error al eliminar los archivos: <${error as string}>`,
      );
    }
  }

  // Private functions
  private formatFileResponse(resource: TCloudinaryResource): TFileResponse {
    return {
      public_id: resource.public_id,
      url: resource.secure_url,
      width: resource.width || undefined, // no se muestran en el objeto
      height: resource.height || undefined,
      format: resource.format || undefined,
      resource_type: resource.resource_type,
      bytes: resource.bytes,
      created_at: resource.created_at,
      type: resource.type,
    };
  }

  private async getImages(
    prefix: string,
    max_results: number = this.MAX_RESULTS,
  ): Promise<TCloudinaryResponse> {
    try {
      return await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        prefix,
        max_results,
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener archivos: ${error.message}`,
      );
    }
  }

  private async getFiles(
    prefix: string,
    max_results: number = this.MAX_RESULTS,
  ): Promise<TCloudinaryResponse> {
    try {
      return await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'raw',
        prefix,
        max_results,
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener archivos: ${error.message}`,
      );
    }
  }

  private optionsDeleteFile(public_ids: string[]) {
    const isRaw = public_ids.some((id) =>
      id.match(/\.(pdf|docx?|doc?|xlsx?|xls?|pptx?|ppt?|zip)$/i),
    );

    const options: Record<string, any> = {};
    if (isRaw) {
      options.resource_type = 'raw';
      options.invalidate = true;
    }

    return options;
  }
}
