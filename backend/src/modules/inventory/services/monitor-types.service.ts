import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMonitorTypeDto, UpdateMonitorTypeDto } from '../dto';
import { TCreateMonitorType, TMonitorType, TUpdateMonitorType } from '../types';

@Injectable()
export class MonitorTypesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMonitorTypeDto: CreateMonitorTypeDto,
  ): Promise<TCreateMonitorType> {
    const newMonitorType = await this.prisma.monitorType.create({
      data: {
        ...createMonitorTypeDto,
      },
    });

    return newMonitorType;
  }

  async findAll(): Promise<TMonitorType[]> {
    const monitorTypes = await this.prisma.monitorType.findMany();

    return monitorTypes;
  }

  async findOne(id: string): Promise<TMonitorType> {
    const monitorType = await this.prisma.monitorType.findUnique({
      where: {
        id,
      },
    });

    if (!monitorType)
      throw new NotFoundException(
        `El tipo de monitor con id <${id}> no fue encontrado.`,
      );

    return monitorType;
  }

  async update(
    id: string,
    updateMonitorTypeDto: UpdateMonitorTypeDto,
  ): Promise<TUpdateMonitorType> {
    const monitorTypeUpdate = await this.prisma.monitorType.update({
      where: {
        id,
      },
      data: {
        ...updateMonitorTypeDto,
      },
    });

    return monitorTypeUpdate;
  }

  async remove(id: string): Promise<TMonitorType> {
    const monitorTypeDelete = await this.prisma.monitorType.delete({
      where: {
        id,
      },
    });

    return monitorTypeDelete;
  }
}
