import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAirConditionerDto, UpdateAirConditionerDto } from '../dto';
import {
  TCreateAirConditioner,
  TAirConditioner,
  TUpdateAirConditioner,
} from '../types';

@Injectable()
export class AirConditionersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createAirConditionerDto: CreateAirConditionerDto,
  ): Promise<TCreateAirConditioner> {
    const newAirConditioner = await this.prisma.airConditioner.create({
      data: {
        ...createAirConditionerDto,
      },
    });

    return newAirConditioner;
  }

  async findAll(): Promise<TAirConditioner[]> {
    const airConditioners = await this.prisma.airConditioner.findMany();

    return airConditioners;
  }

  async findOne(id: string): Promise<TAirConditioner> {
    const airConditioner = await this.prisma.airConditioner.findUnique({
      where: {
        id,
      },
    });

    if (!airConditioner)
      throw new NotFoundException(`La marca con id <${id}> no fue encontrada.`);

    return airConditioner;
  }

  async update(
    id: string,
    updateAirConditionerDto: UpdateAirConditionerDto,
  ): Promise<TUpdateAirConditioner> {
    const airConditionerUpdate = await this.prisma.airConditioner.update({
      where: {
        id,
      },
      data: {
        ...updateAirConditionerDto,
      },
    });

    return airConditionerUpdate;
  }

  async remove(id: string): Promise<TAirConditioner> {
    const airConditionerDelete = await this.prisma.airConditioner.delete({
      where: {
        id,
      },
    });

    return airConditionerDelete;
  }
}
