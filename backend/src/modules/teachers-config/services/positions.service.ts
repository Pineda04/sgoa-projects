import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TPosition } from '../types';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto): Promise<TPosition> {
    const newPosition = await this.prisma.position.create({
      data: {
        ...createPositionDto,
      },
    });

    return newPosition;
  }

  async findAll(): Promise<TPosition[]> {
    const positions = await this.prisma.position.findMany();

    // if (positions.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return positions;
  }

  async findOne(id: string): Promise<TPosition> {
    const position = await this.prisma.position.findUnique({
      where: {
        id,
      },
    });

    if (!position)
      throw new NotFoundException(`El cargo con id <${id}> no fue encontrado.`);

    // throw new HttpException(
    //   `El cargo con id <${id}> no fue encontrado.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return position;
  }

  async findOneByName(name: string): Promise<TPosition> {
    const position = await this.prisma.position.findUnique({
      where: {
        name,
      },
    });

    if (!position)
      throw new NotFoundException(
        `El cargo con nombre <${name}> no fue encontrado.`,
      );

    // throw new HttpException(
    //   `El cargo con id <${id}> no fue encontrado.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return position;
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
  ): Promise<TPosition> {
    const positionUpdate = await this.prisma.position.update({
      where: {
        id,
      },
      data: {
        ...updatePositionDto,
      },
    });

    return positionUpdate;
  }

  async remove(id: string): Promise<TPosition> {
    const positionDelete = await this.prisma.position.delete({
      where: {
        id,
      },
    });

    return positionDelete;
  }
}
