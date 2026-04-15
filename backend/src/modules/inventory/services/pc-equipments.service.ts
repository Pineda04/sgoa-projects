import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePcEquipmentDto, UpdatePcEquipmentDto } from '../dto';
import { TCreatePcEquipment, TPcEquipment, TUpdatePcEquipment } from '../types';
import { IPaginateOutput } from 'src/common/interfaces';
import { QueryPaginationDto } from 'src/common/dto';
import { paginate, paginateOutput } from 'src/common/utils';

@Injectable()
export class PcEquipmentsService {
  constructor(private prisma: PrismaService) {}

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
