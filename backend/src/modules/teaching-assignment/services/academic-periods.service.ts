import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAcademicPeriodDto, UpdateAcademicPeriodDto } from '../dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TCreateAcademicPeriod,
  TAcademicPeriod,
  TUpdateAcademicPeriod,
  TPacModality,
} from '../types';
import { addWeeks, getYear, setYear, startOfDay } from 'date-fns';
import { TCustomPick } from 'src/common/types';

type TCurrentAcademicPeriod = {
  id: string;
  year: number;
  pac_modality: TPacModality;
  pac: number;
  title: string;
  startDate: Date;
  endDate: Date;
};

@Injectable()
export class AcademicPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAcademicPeriodDto: CreateAcademicPeriodDto,
  ): Promise<TCreateAcademicPeriod> {
    const newAcademicPeriod = await this.prisma.academicPeriod.create({
      data: {
        ...createAcademicPeriodDto,
      },
    });

    return newAcademicPeriod;
  }

  async findAll(): Promise<TAcademicPeriod[]> {
    await this.currentAcademicPeriod();
    const academicPeriods = await this.prisma.academicPeriod.findMany();

    return academicPeriods;
  }

  async findOne(id: string): Promise<TAcademicPeriod> {
    const academicPeriod = await this.prisma.academicPeriod.findUnique({
      where: {
        id,
      },
    });

    if (!academicPeriod)
      throw new NotFoundException(
        `El periodo académico con id <${id}> no fue encontrado.`,
      );

    return academicPeriod;
  }

  async findOneByYearPacModality(
    year: number,
    pac: number,
    pac_modality: 'Trimestre' | 'Semestre',
  ): Promise<TAcademicPeriod> {
    const academicPeriod = await this.prisma.academicPeriod.findFirst({
      where: {
        AND: [
          {
            year,
          },
          {
            pac,
          },
          {
            pac_modality,
          },
        ],
      },
    });

    if (!academicPeriod)
      throw new NotFoundException(
        `El periodo académico con los parámetros year <${year}>, pac <${pac}>, pac_modality <${pac_modality}> no fue encontrado.`,
      );

    return academicPeriod;
  }

  async update(
    id: string,
    updateAcademicPeriodDto: UpdateAcademicPeriodDto,
  ): Promise<TUpdateAcademicPeriod> {
    const academicPeriodUpdate = await this.prisma.academicPeriod.update({
      where: {
        id,
      },
      data: {
        ...updateAcademicPeriodDto,
      },
    });

    return academicPeriodUpdate;
  }

  async remove(id: string): Promise<TAcademicPeriod> {
    const academicPeriodDelete = await this.prisma.academicPeriod.delete({
      where: {
        id,
      },
    });

    return academicPeriodDelete;
  }

  currentAcademicPeriod = async (
    pac_modality: TPacModality = 'Trimestre',
  ): Promise<TCurrentAcademicPeriod> => {
    const currentDate = new Date();
    const yearReplace = 2025;

    const localDate = startOfDay(setYear(currentDate, yearReplace));

    // const utcDate = new Date(
    //   Date.UTC(
    //     localDate.getUTCFullYear(),
    //     localDate.getUTCMonth(),
    //     localDate.getUTCDate(),
    //   ),
    // );

    const period = await this.prisma.commonDatesAcademicPeriods.findFirst({
      where: {
        startDate: {
          lte: localDate,
        },
        endDate: {
          gte: localDate,
        },
        pac_modality,
      },
    });

    if (!period)
      throw new BadRequestException(
        'No se encontró un periodo que concuerde con la fecha actual.',
      );

    // const currentPeriod = await this.findOneByYearPacModality(
    //   getYear(startDate),
    //   pac,
    //   pac_modality as 'Trimestre' | 'Semestre',
    // );
    //
    // return currentPeriod;

    const year = getYear(currentDate);

    const currentPeriod = await this.findOneByYearPacModality(
      year,
      period.pac,
      pac_modality,
    );

    return {
      id: currentPeriod.id,
      pac: period.pac,
      pac_modality,
      year,
      title: `No. ${period.pac}, ${pac_modality}, ${year}`,
      startDate: period.startDate,
      endDate: period.endDate,
    };
  };

  getNextAcademicPeriod = async ({
    pac,
    pac_modality,
    year,
    startDate,
  }: TCurrentAcademicPeriod) => {
    // Fecha actual y fecha límite (+4 semanas desde el inicio)
    const now = new Date();
    const fourWeeksAfterStart = addWeeks(startDate, 4);

    // Si aún estamos dentro de las primeras 4 semanas → devolvemos el actual
    if (now <= fourWeeksAfterStart)
      return await this.findOneByYearPacModality(year, pac, pac_modality);

    const periodSearch = this.handlePeriod({ pac, pac_modality, year });

    return await this.findOneByYearPacModality(
      periodSearch.updatedYear,
      periodSearch.updatedPac,
      pac_modality,
    );
  };

  private handlePeriod = ({
    pac,
    pac_modality,
    year,
  }: TCustomPick<TCurrentAcademicPeriod, 'pac' | 'pac_modality' | 'year'>): {
    updatedPac: number;
    updatedYear: number;
  } => {
    const periods = {
      Trimestre: {
        1: {
          updatedPac: pac + 1,
          updatedYear: year,
        },
        2: {
          updatedPac: pac + 1,
          updatedYear: year,
        },
        3: {
          updatedPac: 1,
          updatedYear: year + 1,
        },
      },
      Semestre: {
        1: {
          updatedPac: pac + 1,
          updatedYear: year,
        },
        2: {
          updatedPac: 1,
          updatedYear: year + 1,
        },
      },
    };

    return periods[pac_modality][pac];
  };
}
