import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeachingSessionDto, UpdateTeachingSessionDto } from '../dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TCreateTeachingSession,
  TTeachingSession,
  TUpdateTeachingSession,
} from '../types';

@Injectable()
export class TeachingSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createTeachingSessionDto: CreateTeachingSessionDto,
  ): Promise<TCreateTeachingSession> {
    const newTeachingSession = await this.prisma.teachingSession.create({
      data: {
        ...createTeachingSessionDto,
      },
    });

    return newTeachingSession;
  }

  async findAll(): Promise<TTeachingSession[]> {
    const teachingSessions = await this.prisma.teachingSession.findMany();

    return teachingSessions;
  }

  async findOne(id: string): Promise<TTeachingSession> {
    const teachingSession = await this.prisma.teachingSession.findUnique({
      where: {
        id,
      },
    });

    if (!teachingSession)
      throw new NotFoundException(
        `La sesión de docencia con id <${id}> no fue encontrada.`,
      );

    return teachingSession;
  }

  async update(
    id: string,
    updateTeachingSessionDto: UpdateTeachingSessionDto,
  ): Promise<TUpdateTeachingSession> {
    const teachingSessionUpdate = await this.prisma.teachingSession.update({
      where: {
        id,
      },
      data: {
        ...updateTeachingSessionDto,
      },
    });

    return teachingSessionUpdate;
  }

  async remove(id: string): Promise<TTeachingSession> {
    const teachingSessionDelete = await this.prisma.teachingSession.delete({
      where: {
        id,
      },
    });

    return teachingSessionDelete;
  }
}
