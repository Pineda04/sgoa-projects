import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto';
import { TCreateBrand, TBrand, TUpdateBrand } from '../types';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto): Promise<TCreateBrand> {
    const newBrand = await this.prisma.brand.create({
      data: {
        ...createBrandDto,
      },
    });

    return newBrand;
  }

  async findAll(): Promise<TBrand[]> {
    const brands = await this.prisma.brand.findMany();

    return brands;
  }

  async findOne(id: string): Promise<TBrand> {
    const brand = await this.prisma.brand.findUnique({
      where: {
        id,
      },
    });

    if (!brand)
      throw new NotFoundException(`La marca con id <${id}> no fue encontrada.`);

    return brand;
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
  ): Promise<TUpdateBrand> {
    const brandUpdate = await this.prisma.brand.update({
      where: {
        id,
      },
      data: {
        ...updateBrandDto,
      },
    });

    return brandUpdate;
  }

  async remove(id: string): Promise<TBrand> {
    const brandDelete = await this.prisma.brand.delete({
      where: {
        id,
      },
    });

    return brandDelete;
  }
}
