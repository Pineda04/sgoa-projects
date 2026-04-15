import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConditionDto, UpdateConditionDto } from '../dto';
import { TCreateCondition, TCondition, TUpdateCondition } from '../types';

@Injectable()
export class ConditionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createConditionDto: CreateConditionDto,
  ): Promise<TCreateCondition> {
    const newCondition = await this.prisma.condition.create({
      data: {
        ...createConditionDto,
      },
    });

    return newCondition;
  }

  async findAll(): Promise<TCondition[]> {
    const conditions = await this.prisma.condition.findMany();

    return conditions;
  }

  async findOne(id: string): Promise<TCondition> {
    const condition = await this.prisma.condition.findUnique({
      where: {
        id,
      },
    });

    if (!condition)
      throw new NotFoundException(
        `La condición con id <${id}> no fue encontrada.`,
      );

    return condition;
  }

  async update(
    id: string,
    updateConditionDto: UpdateConditionDto,
  ): Promise<TUpdateCondition> {
    const conditionUpdate = await this.prisma.condition.update({
      where: {
        id,
      },
      data: {
        ...updateConditionDto,
      },
    });

    return conditionUpdate;
  }

  async remove(id: string): Promise<TCondition> {
    const conditionDelete = await this.prisma.condition.delete({
      where: {
        id,
      },
    });

    return conditionDelete;
  }
}
