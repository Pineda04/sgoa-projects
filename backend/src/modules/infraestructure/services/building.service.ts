import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBuildingDto, UpdateBuildingDto } from '../dto';
import { TBuilding, TCreateBuilding, TUpdateBuilding } from '../types';

@Injectable()
export class BuildingService {
  constructor(private prisma: PrismaService) {}

  async create(createBuildingDto: CreateBuildingDto): Promise<TCreateBuilding> {
    const newBuilding = await this.prisma.building.create({
      data: {
        ...createBuildingDto,
      },
    });

    return newBuilding;
  }

  async findAll(): Promise<TBuilding[]> {
    const buildings = await this.prisma.building.findMany();

    return buildings;
  }

  async findOne(id: string): Promise<TBuilding> {
    const building = await this.prisma.building.findUnique({
      where: {
        id,
      },
    });

    if (!building)
      throw new NotFoundException(
        `El edificio con id <${id}> no fue encontrado.`,
      );

    return building;
  }

  async update(
    id: string,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<TUpdateBuilding> {
    const buildingUpdate = await this.prisma.building.update({
      where: {
        id,
      },
      data: {
        ...updateBuildingDto,
      },
    });

    return buildingUpdate;
  }

  async remove(id: string): Promise<TBuilding> {
    const buildingDelete = await this.prisma.building.delete({
      where: {
        id,
      },
    });

    return buildingDelete;
  }
}
