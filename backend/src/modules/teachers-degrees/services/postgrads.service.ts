import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TPostgraduateDegree } from '../types';
import { CreatePostgradDto, UpdatePostgradDto } from '../dto';

@Injectable()
export class PostgradsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPostgradDto: CreatePostgradDto,
  ): Promise<TPostgraduateDegree> {
    const newPostgrad = await this.prisma.postgraduateDegree.create({
      data: {
        ...createPostgradDto,
      },
    });

    return newPostgrad;
  }

  async findAll(): Promise<TPostgraduateDegree[]> {
    const postgrads = await this.prisma.postgraduateDegree.findMany();

    // if (postgrads.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return postgrads;
  }

  async findAllArray(): Promise<string[]> {
    const postgrads = await this.prisma.postgraduateDegree.findMany({
      select: { name: true },
    });

    // return postgrads.length === 0 ? [] : postgrads.map((u) => u.name);
    return postgrads.map((u) => u.name);
  }

  async findOne(id: string): Promise<TPostgraduateDegree> {
    const postgrad = await this.prisma.postgraduateDegree.findUnique({
      where: {
        id,
      },
    });

    if (!postgrad)
      throw new NotFoundException(
        `El pregrado con id <${id}> no fue encontrado.`,
      );

    return postgrad;
  }

  async findOneByName(name: string): Promise<TPostgraduateDegree> {
    const postgrad = await this.prisma.postgraduateDegree.findUnique({
      where: {
        name,
      },
    });

    if (!postgrad)
      throw new NotFoundException(
        `El pregrado con nombre <${name}> no fue encontrado.`,
      );

    return postgrad;
  }

  async update(
    id: string,
    updatePostgradDto: UpdatePostgradDto,
  ): Promise<TPostgraduateDegree> {
    const postgradUpdate = await this.prisma.postgraduateDegree.update({
      where: {
        id,
      },
      data: {
        ...updatePostgradDto,
      },
    });

    return postgradUpdate;
  }

  async remove(id: string): Promise<TPostgraduateDegree> {
    const postgradDelete = await this.prisma.postgraduateDegree.delete({
      where: {
        id,
      },
    });

    return postgradDelete;
  }
}
