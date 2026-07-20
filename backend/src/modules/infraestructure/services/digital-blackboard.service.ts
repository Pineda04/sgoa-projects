import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDigitalBlackboardDto } from '../dto/create-digital-blackboard.dto';
import { UpdateDigitalBlackboardDto } from '../dto/update-digital-blackboard.dto';
import {
  TDigitalBlackboard,
  TCreateDigitalBlackboard,
  TUpdateDigitalBlackboard,
} from '../types';

@Injectable()
export class DigitalBlackboardService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDigitalBlackboardDto: CreateDigitalBlackboardDto,
  ): Promise<TCreateDigitalBlackboard> {
    const newDigitalBlackboard = await this.prisma.digitalBlackboard.create({
      data: {
        ...createDigitalBlackboardDto,
      },
    });

    return newDigitalBlackboard;
  }

  async findAll(): Promise<TDigitalBlackboard[]> {
    const digitalBlackboards = await this.prisma.digitalBlackboard.findMany();

    return digitalBlackboards;
  }

  async findOne(id: string): Promise<TDigitalBlackboard> {
    const digitalBlackboard = await this.prisma.digitalBlackboard.findUnique({
      where: {
        id,
      },
    });

    if (!digitalBlackboard)
      throw new NotFoundException(
        `La pizarra digital con id <${id}> no fue encontrada.`,
      );

    return digitalBlackboard;
  }

  async update(
    id: string,
    updateDigitalBlackboardDto: UpdateDigitalBlackboardDto,
  ): Promise<TUpdateDigitalBlackboard> {
    await this.findOne(id);

    const digitalBlackboardUpdate = await this.prisma.digitalBlackboard.update({
      where: {
        id,
      },
      data: {
        ...updateDigitalBlackboardDto,
      },
    });

    return digitalBlackboardUpdate;
  }

  async remove(id: string): Promise<TDigitalBlackboard> {
    await this.findOne(id);

    const digitalBlackboardDelete = await this.prisma.digitalBlackboard.delete({
      where: {
        id,
      },
    });

    return digitalBlackboardDelete;
  }
}