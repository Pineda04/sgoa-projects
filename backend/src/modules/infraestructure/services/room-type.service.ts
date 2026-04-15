import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from '../dto';
import { TCreateRoomType, TRoomType, TUpdateRoomType } from '../types';

@Injectable()
export class RoomTypeService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<TCreateRoomType> {
    const newRoomType = await this.prisma.roomType.create({
      data: {
        ...createRoomTypeDto,
      },
    });

    return newRoomType;
  }

  async findAll(): Promise<TRoomType[]> {
    const roomTypes = await this.prisma.roomType.findMany();

    return roomTypes;
  }

  async findOne(id: string): Promise<TRoomType> {
    const roomType = await this.prisma.roomType.findUnique({
      where: {
        id,
      },
    });

    if (!roomType)
      throw new NotFoundException(
        `El tipo de aula con id <${id}> no fue encontrado.`,
      );

    return roomType;
  }

  async update(
    id: string,
    updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<TUpdateRoomType> {
    const roomTypeUpdate = await this.prisma.roomType.update({
      where: {
        id,
      },
      data: {
        ...updateRoomTypeDto,
      },
    });

    return roomTypeUpdate;
  }

  async remove(id: string): Promise<TRoomType> {
    const roomTypeDelete = await this.prisma.roomType.delete({
      where: {
        id,
      },
    });

    return roomTypeDelete;
  }
}
