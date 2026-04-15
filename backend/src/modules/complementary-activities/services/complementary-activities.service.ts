import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateComplementaryActivityDto,
  UpdateComplementaryActivityDto,
} from '../dto';
import { TComplementaryActivity, TVerificationMediaFile } from '../types';
import { normalizeText, paginate, paginateOutput } from 'src/common/utils';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { ActivityTypesService } from './activity-types.service';
import { VerificationMediasService } from './verification-medias.service';
import { CloudinaryService } from 'src/modules/cloudinary/services/cloudinary.service';

@Injectable()
export class ComplementaryActivitiesService {
  private readonly includeOptionsCA = {
    include: {
      activityType: true,
      verificationMedia: {
        include: {
          verificationMediaFiles: true,
        },
      },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityTypesService: ActivityTypesService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => VerificationMediasService))
    private readonly verificationMediasService: VerificationMediasService,
  ) {}

  async create(
    createComplementaryActivityDto: CreateComplementaryActivityDto,
    files: Express.Multer.File[],
  ): Promise<TComplementaryActivity> {
    if (files.length) await this.verificationMediasService.handleFiles(files);

    const { activityType, description, ...dataToCreate } =
      createComplementaryActivityDto;
    const activityTypeExists =
      await this.activityTypesService.findOneByName(activityType);

    const newComplementaryActivity =
      await this.prisma.complementaryActivity.create({
        data: {
          ...dataToCreate,
          activityTypeId: activityTypeExists.id,
          // activityType: {
          //   connect: {
          //     name: activityType,
          //   },
          // },
          // assignmentReport: {
          //   connect: {
          //     id: assignmentReportId,
          //   },
          // },
        },
        relationLoadStrategy: 'join',
        include: {
          activityType: true,
        },
      });

    // TODO: esto genera una dependencia circular, ver este caso despues.
    // manejo de archivos, para no modificar tanto, de momento utilizaremos el create de verificationMediasService
    const newVerificationMedia = await this.verificationMediasService.create(
      {
        description,
        activityId: newComplementaryActivity.id,
      },
      files,
    );

    return {
      ...newComplementaryActivity,
      verificationMedia: newVerificationMedia,
    };
  }

  async findAll(): Promise<TComplementaryActivity[]> {
    const complementaryActivities =
      await this.prisma.complementaryActivity.findMany({
        relationLoadStrategy: 'join',
        ...this.includeOptionsCA,
      });

    return complementaryActivities;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TComplementaryActivity>> {
    const [complementaryActivities, count] = await Promise.all([
      this.prisma.complementaryActivity.findMany({
        ...paginate(query),
        relationLoadStrategy: 'join',
        ...this.includeOptionsCA,
      }),
      this.prisma.complementaryActivity.count(),
    ]);

    return paginateOutput<TComplementaryActivity>(
      complementaryActivities,
      count,
      query,
    );
  }

  async findAllByUserIdAndCode(
    query: QueryPaginationDto,
    user: {
      userId?: string;
      code?: string;
    },
  ): Promise<IPaginateOutput<TComplementaryActivity>> {
    // const teacher = await this.teachersService.findOneByUserId(userId);
    const { userId, code } = user;

    const [complementaryActivities, count] = await Promise.all([
      this.prisma.complementaryActivity.findMany({
        where: {
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
        ...paginate(query),
        relationLoadStrategy: 'join',
        ...this.includeOptionsCA,
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
        `No encontraron se actividades complementarias para el usuario <${userId ?? code}>.`,
      );

    return paginateOutput<TComplementaryActivity>(
      complementaryActivities,
      count,
      query,
    );
  }

  async findOne(id: string): Promise<TComplementaryActivity> {
    const complementaryActivity =
      await this.prisma.complementaryActivity.findUnique({
        where: {
          id,
        },
        relationLoadStrategy: 'join',
        ...this.includeOptionsCA,
      });

    if (!complementaryActivity)
      throw new NotFoundException(
        `La actividad complementaria con id ${id} no fue encontrada.`,
      );

    return complementaryActivity;
  }

  async findUserCodeByActivityId(id: string): Promise<string> {
    const userInfo = await this.prisma.complementaryActivity.findUnique({
      where: {
        id,
      },
      relationLoadStrategy: 'join',
      select: {
        assignmentReport: {
          select: {
            teacher: {
              select: {
                user: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userInfo)
      throw new NotFoundException(
        `El código del usuario asociado al actividad complementaria con id <${id}> no fue encontrada`,
      );

    return userInfo.assignmentReport.teacher.user.code;
  }

  async update(
    id: string,
    updateComplementaryActivityDto: UpdateComplementaryActivityDto,
  ): Promise<TComplementaryActivity> {
    const { activityType, ...dataToUpdate } = updateComplementaryActivityDto;
    const activityTypeExists =
      activityType &&
      (await this.activityTypesService.findOneByName(activityType));

    const activityTypeUpdate = await this.prisma.complementaryActivity.update({
      where: {
        id,
      },
      data: {
        ...dataToUpdate,
        ...(activityTypeExists && { activityTypeId: activityTypeExists.id }),
      },
      relationLoadStrategy: 'join',
      ...this.includeOptionsCA,
    });

    return activityTypeUpdate;
  }

  async updateWithFiles(
    id: string,
    updateComplementaryActivityDto: UpdateComplementaryActivityDto,
    files: Express.Multer.File[],
  ): Promise<TComplementaryActivity> {
    const { activityType, description, ...dataToUpdate } =
      updateComplementaryActivityDto;
    const activityTypeExists =
      activityType &&
      (await this.activityTypesService.findOneByName(activityType));

    const activityTypeUpdate = await this.prisma.complementaryActivity.update({
      where: {
        id,
      },
      data: {
        ...dataToUpdate,
        ...(activityTypeExists && { activityTypeId: activityTypeExists.id }),
        // ...(description && {
        //   verificationMedia: {
        //     update: {
        //       data: {
        //         description,
        //       },
        //     },
        //   },
        // }),
        // ...(files.length > 0 && {
        //   verificationMedia: {
        //     create: {
        //       verificationMediaFiles: {
        //         createMany: {
        //           data: filesParsed,
        //         },
        //       },
        //     },
        //   },
        // }),
      },
      relationLoadStrategy: 'join',
      ...this.includeOptionsCA,
    });

    await this.verificationMediasService.updateWithFilesByComplementaryActivityId(
      id,
      {
        description,
        files,
      },
    );

    return activityTypeUpdate;
  }

  async remove(id: string): Promise<TComplementaryActivity> {
    const complementaryActivity = await this.findOne(id);
    // await this.prisma.complementaryActivity.findUnique({
    //   where: {
    //     id,
    //   },
    //   relationLoadStrategy: 'join',
    //   ...this.includeOptionsCA,
    // });

    if (
      complementaryActivity.verificationMedia &&
      complementaryActivity.verificationMedia?.verificationMediaFiles.length !==
        0
    ) {
      const public_ids =
        complementaryActivity.verificationMedia.verificationMediaFiles.map(
          ({ public_id }: TVerificationMediaFile) => public_id,
        );

      await this.cloudinaryService.removeMultiple(public_ids);
    }

    const complementaryActivityDelete =
      await this.prisma.complementaryActivity.delete({
        where: {
          id,
        },
        relationLoadStrategy: 'join',
        ...this.includeOptionsCA,
      });

    return complementaryActivityDelete;
  }
}
