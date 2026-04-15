import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TShift } from '../types';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(createShiftDto: CreateShiftDto): Promise<TShift> {
    const newShift = await this.prisma.shift.create({
      data: {
        ...createShiftDto,
      },
    });

    return newShift;
  }

  async findAll(): Promise<TShift[]> {
    const shifts = await this.prisma.shift.findMany();

    // if (shifts.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return shifts;
  }

  async findOne(id: string): Promise<TShift> {
    const shift = await this.prisma.shift.findUnique({
      where: {
        id,
      },
    });

    if (!shift)
      throw new NotFoundException(
        `La jornada con id <${id}> no fue encontrada.`,
      );

    return shift;
  }

  async findOneByName(name: string): Promise<TShift> {
    const shift = await this.prisma.shift.findUnique({
      where: {
        name,
      },
    });

    if (!shift)
      throw new NotFoundException(
        `La jornada con nombre <${name}> no fue encontrada.`,
      );

    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<TShift> {
    const shiftUpdate = await this.prisma.shift.update({
      where: {
        id,
      },
      data: {
        ...updateShiftDto,
      },
    });

    return shiftUpdate;
  }

  async remove(id: string): Promise<TShift> {
    const shiftDelete = await this.prisma.shift.delete({
      where: {
        id,
      },
    });

    return shiftDelete;
  }
}
