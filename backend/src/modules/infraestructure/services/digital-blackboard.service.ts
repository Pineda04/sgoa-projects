import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateDigitalBlackboardDto } from '../dto/create-digital-blackboard.dto';
import { UpdateDigitalBlackboardDto } from '../dto/update-digital-blackboard.dto';
import { TDigitalBlackboard } from '../types';

const digitalBlackboardInclude = {
  classroom: {
    include: {
      building: {
        include: {
          center: true,
        },
      },
    },
  },
} satisfies Prisma.DigitalBlackboardInclude;

type TDigitalBlackboardWithRelations = Prisma.DigitalBlackboardGetPayload<{
  include: typeof digitalBlackboardInclude;
}>;

@Injectable()
export class DigitalBlackboardService {
  constructor(private prisma: PrismaService) {}

  private readonly digitalBlackboardInclude = digitalBlackboardInclude;

  private mapToDigitalBlackboard(
    db: TDigitalBlackboardWithRelations,
  ): TDigitalBlackboard {
    return {
      id: db.id,
      description: db.description,
      brandId: db.brandId,
      monitorTypeId: db.monitorTypeId,
      monitorSizeId: db.monitorSizeId,
      conditionId: db.conditionId,
      classroom: db.classroom
        ? {
            id: db.classroom.id,
            name: db.classroom.name,
            build: db.classroom.building
              ? {
                  id: db.classroom.building.id,
                  name: db.classroom.building.name,
                  center: db.classroom.building.center
                    ? {
                        id: db.classroom.building.center.id,
                        name: db.classroom.building.center.name,
                      }
                    : null,
                }
              : null,
          }
        : null,
    };
  }

  async create(
    createDigitalBlackboardDto: CreateDigitalBlackboardDto,
  ): Promise<TDigitalBlackboard> {
    const newDigitalBlackboard = await this.prisma.digitalBlackboard.create({
      data: {
        ...createDigitalBlackboardDto,
      },
      include: this.digitalBlackboardInclude,
    });

    return this.mapToDigitalBlackboard(newDigitalBlackboard);
  }

  async findAll(): Promise<TDigitalBlackboard[]> {
    const digitalBlackboards = await this.prisma.digitalBlackboard.findMany({
      include: this.digitalBlackboardInclude,
    });

    return digitalBlackboards.map((db) => this.mapToDigitalBlackboard(db));
  }

  async findOne(id: string): Promise<TDigitalBlackboard> {
    const digitalBlackboard = await this.prisma.digitalBlackboard.findUnique({
      where: {
        id,
      },
      include: this.digitalBlackboardInclude,
    });

    if (!digitalBlackboard)
      throw new NotFoundException(
        `La pizarra digital con id <${id}> no fue encontrada.`,
      );

    return this.mapToDigitalBlackboard(digitalBlackboard);
  }

  async update(
    id: string,
    updateDigitalBlackboardDto: UpdateDigitalBlackboardDto,
  ): Promise<TDigitalBlackboard> {
    await this.findOne(id);

    const digitalBlackboardUpdate = await this.prisma.digitalBlackboard.update({
      where: {
        id,
      },
      data: {
        ...updateDigitalBlackboardDto,
      },
      include: this.digitalBlackboardInclude,
    });

    return this.mapToDigitalBlackboard(digitalBlackboardUpdate);
  }

  async remove(id: string): Promise<TDigitalBlackboard> {
    await this.findOne(id);

    const digitalBlackboardDelete = await this.prisma.digitalBlackboard.delete({
      where: {
        id,
      },
      include: this.digitalBlackboardInclude,
    });

    return this.mapToDigitalBlackboard(digitalBlackboardDelete);
  }
}
