import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateVerificationMediaDto,
  UpdateVerificationMediaDto,
  UpdateVerificationMediaWithFilesDto,
} from '../dto';
import { TVerificationMedia, TVerificationMediaFile } from '../types';
import { MultimediaTypesService } from './multimedia-types.service';
import { QueryPaginationDto } from 'src/common/dto';
import { IPaginateOutput } from 'src/common/interfaces';
import { normalizeText, paginate, paginateOutput } from 'src/common/utils';
import { MULTIMEDIA_TYPES_EXTEND } from '../enums';
import { CloudinaryService } from 'src/modules/cloudinary/services/cloudinary.service';
import { ComplementaryActivitiesService } from './complementary-activities.service';
import { TCustomOmit, TCustomPick } from 'src/common/types';

type TFile = Express.Multer.File & {
  multimediaTypeId: string;
};

@Injectable()
export class VerificationMediasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly multimediaTypesService: MultimediaTypesService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => ComplementaryActivitiesService))
    private readonly complementaryActivitiesService: ComplementaryActivitiesService,
  ) {}

  async create(
    createVerificationMediaDto: CreateVerificationMediaDto,
    files: Express.Multer.File[],
  ): Promise<TVerificationMedia> {
    const filesParsed: TCustomPick<
      TVerificationMediaFile,
      'url' | 'multimediaTypeId' | 'public_id'
    >[] =
      files.length === 0
        ? []
        : await this.handleFilesAndActivity(
            createVerificationMediaDto.activityId,
            files,
          );

    const newVerificationMedia = await this.prisma.verificationMedia.create({
      data: {
        ...createVerificationMediaDto,
        verificationMediaFiles: {
          createMany: {
            data: filesParsed,
          },
        },
      },
      relationLoadStrategy: 'join',
      include: {
        verificationMediaFiles: true,
      },
    });

    return newVerificationMedia;
  }

  async findAll(): Promise<TVerificationMedia[]> {
    const verificationMedias = await this.prisma.verificationMedia.findMany({
      relationLoadStrategy: 'join',
      include: {
        verificationMediaFiles: true,
      },
    });

    return verificationMedias;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TVerificationMedia>> {
    const [verificationMedias, count] = await Promise.all([
      this.prisma.verificationMedia.findMany({
        ...paginate(query),
        relationLoadStrategy: 'join',
        include: {
          verificationMediaFiles: true,
        },
      }),
      this.prisma.complementaryActivity.count(),
    ]);

    return paginateOutput<TVerificationMedia>(verificationMedias, count, query);
  }

  async findAllByUserIdAndCode(
    query: QueryPaginationDto,
    user: {
      userId?: string;
      code?: string;
    },
  ): Promise<IPaginateOutput<TVerificationMedia>> {
    // const teacher = await this.teachersService.findOneByUserId(userId);
    const { userId, code } = user;

    const [verificationMedias, count] = await Promise.all([
      this.prisma.verificationMedia.findMany({
        where: {
          complementaryActivity: {
            assignmentReport: {
              teacher: {
                OR: [
                  {
                    userId,
                  },
                  {
                    user: {
                      code: code ? normalizeText(code) : undefined,
                    },
                  },
                ],
              },
            },
          },
        },
        ...paginate(query),
        relationLoadStrategy: 'join',
        include: {
          verificationMediaFiles: true,
        },
      }),
      this.prisma.academicAssignmentReport.count({
        where: {
          teacher: {
            userId,
          },
        },
      }),
    ]);

    if (count === 0)
      throw new NotFoundException(
        `No se encontraron medio de verificación para el usuario <${userId ?? code}>.`,
      );

    return paginateOutput<TVerificationMedia>(verificationMedias, count, query);
  }
  async findOne(id: string): Promise<TVerificationMedia> {
    const verificationMedia = await this.prisma.verificationMedia.findUnique({
      where: {
        id,
      },
      relationLoadStrategy: 'join',
      include: {
        verificationMediaFiles: true,
      },
    });

    if (!verificationMedia)
      throw new NotFoundException(
        `El medio de verificación con id ${id} no fue encontrada.`,
      );

    return verificationMedia;
  }

  async update(
    id: string,
    updateVerificationMediaDto: UpdateVerificationMediaDto,
  ): Promise<TCustomOmit<TVerificationMedia, 'verificationMediaFiles'>> {
    // const { multimediaType, ...dataWithoutMultimediaType } =
    //   updateVerificationMediaDto;

    // const dataToUpdate: Omit<UpdateVerificationMediaDto, 'multimediaType'> & {
    //   multimediaTypeId?: string;
    // } = {
    //   ...dataWithoutMultimediaType,
    // };

    // if (multimediaType) {
    //   const multimediaTypeExists =
    //     await this.multimediaTypesService.findOneByDescription(multimediaType);
    //
    //   dataToUpdate.multimediaTypeId = multimediaTypeExists.id;
    // }

    const verificationMediaUpdate = await this.prisma.verificationMedia.update({
      where: {
        id,
      },
      data: {
        ...updateVerificationMediaDto,
      },
    });

    return verificationMediaUpdate;
  }

  async updateWithFilesByComplementaryActivityId(
    complementaryActivityId: string,
    updateVerificationMediaWithFilesDto: UpdateVerificationMediaWithFilesDto,
  ): Promise<TCustomOmit<TVerificationMedia, 'verificationMediaFiles'>> {
    const { files, ...dataToUpdate } = updateVerificationMediaWithFilesDto;

    const filesParsed: TCustomPick<
      TVerificationMediaFile,
      'url' | 'multimediaTypeId' | 'public_id'
    >[] =
      files.length === 0
        ? []
        : await this.handleFilesAndActivity(complementaryActivityId, files);

    const verificationMediaUpdate = await this.prisma.verificationMedia.update({
      where: {
        activityId: complementaryActivityId,
      },
      data: {
        ...dataToUpdate,
        verificationMediaFiles: {
          createMany: {
            data: filesParsed,
          },
        },
      },
    });

    return verificationMediaUpdate;
  }

  async remove(id: string): Promise<TVerificationMedia> {
    const verificationMediaDelete = await this.prisma.verificationMedia.delete({
      where: {
        id,
      },
      relationLoadStrategy: 'join',
      include: {
        verificationMediaFiles: true,
      },
    });

    return verificationMediaDelete;
  }

  // VerificationMedia => File
  async removeFile(id: string): Promise<TVerificationMediaFile> {
    const file = await this.prisma.verificationMediaFile.findUnique({
      where: {
        id,
      },
    });

    if (!file)
      throw new BadRequestException(
        `El archivo con id <${id}> no fue encontrado.`,
      );

    // Eliminar de Cloudinary primero
    await this.cloudinaryService.remove(
      (file as TVerificationMediaFile).public_id,
    );

    const verificationMediaDelete =
      await this.prisma.verificationMediaFile.delete({
        where: {
          id,
        },
      });

    return verificationMediaDelete;
  }

  async removePersonal(
    currentUserId: string,
    id: string,
  ): Promise<TVerificationMedia> {
    const verificationMedia = await this.prisma.verificationMedia.findFirst({
      where: {
        id,
        complementaryActivity: {
          assignmentReport: {
            teacher: {
              userId: currentUserId,
            },
          },
        },
      },
      relationLoadStrategy: 'join',
      include: {
        verificationMediaFiles: true,
      },
    });

    if (!verificationMedia)
      throw new NotFoundException(
        `El medio de verificación no fue encontrado.`,
      );

    if (verificationMedia.verificationMediaFiles.length !== 0) {
      const public_ids = verificationMedia.verificationMediaFiles.map(
        ({ public_id }: TVerificationMediaFile) => public_id,
      );

      await this.cloudinaryService.removeMultiple(public_ids);
    }

    const verificationMediaDelete = await this.prisma.verificationMedia.delete({
      where: { id },
      relationLoadStrategy: 'join',
      include: { verificationMediaFiles: true },
    });

    return verificationMediaDelete;
  }

  // VerificationMedia => File => Cloudinary
  async removeFilePersonal(
    currentUserId: string,
    fileId: string,
  ): Promise<TVerificationMediaFile> {
    const verificationMediaFile =
      await this.prisma.verificationMediaFile.findFirst({
        where: {
          id: fileId,
          // Para asegurarse de que se se esta eliminando el del usuario autenticado
          verificationMedia: {
            complementaryActivity: {
              assignmentReport: {
                teacher: {
                  userId: currentUserId,
                },
              },
            },
          },
        },
      });

    if (!verificationMediaFile)
      throw new NotFoundException(
        `El archivo del medio de verificación no fue encontrado.`,
      );

    await this.cloudinaryService.remove(
      (verificationMediaFile as TVerificationMediaFile).public_id,
    );

    const verificationMediaDelete =
      await this.prisma.verificationMediaFile.delete({
        where: { id: fileId },
      });

    return verificationMediaDelete;
  }

  async handleFilesAndActivity(
    activityId: string,
    files: Express.Multer.File[],
  ): Promise<
    TCustomPick<
      TVerificationMediaFile,
      'url' | 'multimediaTypeId' | 'public_id'
    >[]
  > {
    const results: TCustomPick<
      TVerificationMediaFile,
      'url' | 'multimediaTypeId' | 'public_id'
    >[] = [];

    const [code, activity] = await Promise.all([
      this.complementaryActivitiesService.findUserCodeByActivityId(activityId),
      this.complementaryActivitiesService.findOne(activityId),
    ]);

    const validFiles = await this.handleFiles(files);

    for (const file of validFiles) {
      const uploadResult = await this.cloudinaryService.handleFileUpload(
        file,
        code,
        activity.activityType.name,
      );

      results.push({
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        multimediaTypeId: file.multimediaTypeId,
      });
    }

    return results;
  }

  async handleFiles(files: Express.Multer.File[]): Promise<TFile[]> {
    const multipediaTypes = await this.multimediaTypesService.findAll();

    const multimediaTypesMap = new Map(
      multipediaTypes.map((mt) => [mt.description, mt]),
    );

    const validFiles: TFile[] = [];

    for (const file of files) {
      const extension =
        file.originalname.toString().toUpperCase().split('.').pop() || '';

      if (!Object.keys(MULTIMEDIA_TYPES_EXTEND).includes(extension))
        throw new BadRequestException(`El tipo de archivo no es válido.`);

      const multimediaType = MULTIMEDIA_TYPES_EXTEND[extension] as string;

      const multimediaTypeExists = multimediaTypesMap.get(multimediaType);

      // Si bien se validan antes, es probable que alguien elimine alguno
      if (!multimediaTypeExists)
        throw new NotFoundException(
          `El tipo de multimiedia <${multimediaType}> no fue encontrado.`,
        );

      validFiles.push({
        ...file,
        multimediaTypeId: multimediaTypeExists.id,
      });
    }

    return validFiles;
  }
}
