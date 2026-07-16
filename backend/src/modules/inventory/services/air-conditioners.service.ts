import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAirConditionerDto, UpdateAirConditionerDto } from '../dto';
import { TAirConditioner } from '../types';

@Injectable()
export class AirConditionersService {
  constructor(private prisma: PrismaService) { }

  private readonly airConditionerInclude = {
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
    classroom: {
      include: {
        building: {
          include: {
            center: true,
          },
        },
      },
    },
  };

  private mapToAirConditioner(ac: any): TAirConditioner {
    return {
      id: ac.id,
      description: ac.description,
      brand: ac.brand
        ? {
          id: ac.brand.id,
          name: ac.brand.name,
        }
        : null,
      condition: ac.condition
        ? {
          id: ac.condition.id,
          status: ac.condition.status,
        }
        : null,
      classroom: ac.classroom
        ? {
          id: ac.classroom.id,
          name: ac.classroom.name,
          build: ac.classroom.building
            ? {
              id: ac.classroom.building.id,
              name: ac.classroom.building.name,
              center: ac.classroom.building.center
                ? {
                  id: ac.classroom.building.center.id,
                  name: ac.classroom.building.center.name,
                }
                : null,
            }
            : null,
        }
        : null,
    };
  }

  async create(
    createAirConditionerDto: CreateAirConditionerDto,
  ): Promise<TAirConditioner> {
    const newAirConditioner = await this.prisma.airConditioner.create({
      data: {
        ...createAirConditionerDto,
      },
      include: this.airConditionerInclude,
    });

    return this.mapToAirConditioner(newAirConditioner);
  }

  async findAll(): Promise<TAirConditioner[]> {
    const airConditioners = await this.prisma.airConditioner.findMany({
      include: this.airConditionerInclude,
    });

    return airConditioners.map((ac) => this.mapToAirConditioner(ac));
  }

  async findOne(id: string): Promise<TAirConditioner> {
    const airConditioner = await this.prisma.airConditioner.findUnique({
      where: {
        id,
      },
      include: this.airConditionerInclude,
    });

    if (!airConditioner)
      throw new NotFoundException(`El aire acondicionado con id <${id}> no fue encontrado.`);

    return this.mapToAirConditioner(airConditioner);
  }

  async update(
    id: string,
    updateAirConditionerDto: UpdateAirConditionerDto,
  ): Promise<TAirConditioner> {
    const airConditionerUpdate = await this.prisma.airConditioner.update({
      where: {
        id,
      },
      data: {
        ...updateAirConditionerDto,
      },
      include: this.airConditionerInclude,
    });

    return this.mapToAirConditioner(airConditionerUpdate);
  }

  async remove(id: string): Promise<TAirConditioner> {
    const airConditionerDelete = await this.prisma.airConditioner.delete({
      where: {
        id,
      },
      include: this.airConditionerInclude,
    });

    return this.mapToAirConditioner(airConditionerDelete);
  }
}

