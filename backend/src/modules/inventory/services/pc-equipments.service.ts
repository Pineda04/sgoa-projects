import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreatePcEquipmentDto, UpdatePcEquipmentDto } from '../dto';
import {
  TCreatePcEquipment,
  TPcEquipment,
  TPcEquipmentWithRelations,
  TUpdatePcEquipment,
} from '../types';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { paginate, paginateOutput } from 'src/common/utils';

const pcEquipmentInclude = {
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
  condition: {
    select: {
      id: true,
      status: true,
    },
  },
  monitorType: {
    select: {
      id: true,
      description: true,
    },
  },
  monitorSize: {
    select: {
      id: true,
      description: true,
    },
  },
  pcType: {
    select: {
      id: true,
      description: true,
    },
  },
} satisfies Prisma.PcEquipmentInclude;

type TPcEquipmentWithRelationsPayload = Prisma.PcEquipmentGetPayload<{
  include: typeof pcEquipmentInclude;
}>;

@Injectable()
export class PcEquipmentsService {
  constructor(private prisma: PrismaService) {}

  private readonly pcEquipmentInclude = pcEquipmentInclude;

  private mapToPcEquipmentWithRelations(
    pcEquipment: TPcEquipmentWithRelationsPayload,
  ): TPcEquipmentWithRelations {
    return {
      id: pcEquipment.id,
      inventoryNumber: pcEquipment.inventoryNumber,
      processor: pcEquipment.processor,
      ram: pcEquipment.ram,
      disk: pcEquipment.disk,
      classroomId: pcEquipment.classroomId,
      brand: pcEquipment.brand,
      condition: pcEquipment.condition,
      monitorType: pcEquipment.monitorType,
      monitorSize: pcEquipment.monitorSize,
      pcType: pcEquipment.pcType,
    };
  }

  async create(
    createPcEquipmentDto: CreatePcEquipmentDto,
  ): Promise<TCreatePcEquipment> {
    const newPcEquipment = await this.prisma.pcEquipment.create({
      data: {
        ...createPcEquipmentDto,
      },
    });

    return newPcEquipment;
  }

  async findAll(): Promise<TPcEquipment[]> {
    const pcEquipments = await this.prisma.pcEquipment.findMany();

    return pcEquipments;
  }

  async findAllByClassroom(
    classroomId: string,
  ): Promise<TPcEquipmentWithRelations[]> {
    const pcEquipments = await this.prisma.pcEquipment.findMany({
      where: { classroomId },
      include: this.pcEquipmentInclude,
    });

    return pcEquipments.map((pc) => this.mapToPcEquipmentWithRelations(pc));
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TPcEquipment>> {
    const [pcEquipments, count] = await Promise.all([
      this.prisma.pcEquipment.findMany({
        ...paginate(query),
      }),
      this.prisma.pcEquipment.count(),
    ]);

    return paginateOutput<TPcEquipment>(pcEquipments, count, query);
  }

  async findOne(id: string): Promise<TPcEquipment> {
    const pcEquipment = await this.prisma.pcEquipment.findUnique({
      where: {
        id,
      },
    });

    if (!pcEquipment)
      throw new NotFoundException(`La marca con id <${id}> no fue encontrada.`);

    return pcEquipment;
  }

  async update(
    id: string,
    updatePcEquipmentDto: UpdatePcEquipmentDto,
  ): Promise<TUpdatePcEquipment> {
    const pcEquipmentUpdate = await this.prisma.pcEquipment.update({
      where: {
        id,
      },
      data: {
        ...updatePcEquipmentDto,
      },
    });

    return pcEquipmentUpdate;
  }

  async remove(id: string): Promise<TPcEquipment> {
    const pcEquipmentDelete = await this.prisma.pcEquipment.delete({
      where: {
        id,
      },
    });

    return pcEquipmentDelete;
  }
}
