import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TDigitalBlackboardType } from '../types';

@Injectable()
export class DigitalBlackboardService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<TDigitalBlackboardType[]> {
    const digitalBlackboards = await this.prisma.digitalBlackboard.findMany();

    return digitalBlackboards;
  }

  async findOne(id: string): Promise<TDigitalBlackboardType> {
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
}
