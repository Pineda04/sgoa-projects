import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TCreateConnectivity,
  TConnectivity,
  TUpdateConnectivity,
} from '../types';
import { CreateConnectivityDto } from '../dto/create-connectivity.dto';
import { UpdateConnectivityDto } from '../dto/update-connectivity.dto';

@Injectable()
export class ConnectivityService {
  constructor(private prisma: PrismaService) {}

  async create(
    createConnectivityDto: CreateConnectivityDto,
  ): Promise<TCreateConnectivity> {
    const newConnectivity = await this.prisma.connectivity.create({
      data: {
        ...createConnectivityDto,
      },
    });

    return newConnectivity;
  }

  async findAll(): Promise<TConnectivity[]> {
    const connectivities = await this.prisma.connectivity.findMany();

    return connectivities;
  }

  async findOne(id: string): Promise<TConnectivity> {
    const connectivity = await this.prisma.connectivity.findUnique({
      where: {
        id,
      },
    });

    if (!connectivity)
      throw new NotFoundException(
        `La conectividad con id <${id}> no fue encontrado.`,
      );

    return connectivity;
  }

  async update(
    id: string,
    updateConnectivityDto: UpdateConnectivityDto,
  ): Promise<TUpdateConnectivity> {
    const connectivityUpdate = await this.prisma.connectivity.update({
      where: {
        id,
      },
      data: {
        ...updateConnectivityDto,
      },
    });

    return connectivityUpdate;
  }

  async remove(id: string): Promise<TConnectivity> {
    const connectivityDelete = await this.prisma.connectivity.delete({
      where: {
        id,
      },
    });

    return connectivityDelete;
  }
}
