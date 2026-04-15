import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractTypeDto } from '../dto/create-contract-type.dto';
import { UpdateContractTypeDto } from '../dto/update-contract-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TContractType } from '../types';

@Injectable()
export class ContractTypesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createContractTypeDto: CreateContractTypeDto,
  ): Promise<TContractType> {
    const newContractType = await this.prisma.contractType.create({
      data: {
        ...createContractTypeDto,
      },
    });

    return newContractType;
  }

  async findAll(): Promise<TContractType[]> {
    const contractTypes = await this.prisma.contractType.findMany();

    // if (contractTypes.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return contractTypes;
  }

  async findOne(id: string): Promise<TContractType> {
    const contractType = await this.prisma.contractType.findUnique({
      where: {
        id,
      },
    });

    if (!contractType)
      throw new NotFoundException(
        `El tipo de contrato con id <${id}> no fue encontrado.`,
      );

    return contractType;
  }

  async findOneByName(name: string): Promise<TContractType> {
    const contractType = await this.prisma.contractType.findUnique({
      where: {
        name,
      },
    });

    if (!contractType)
      throw new NotFoundException(
        `El tipo de contrato con nombre <${name}> no fue encontrado.`,
      );

    // throw new HttpException(
    //   `El rol con id <${id}> no fue encontrado.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return contractType;
  }

  async update(
    id: string,
    updateContractTypeDto: UpdateContractTypeDto,
  ): Promise<TContractType> {
    const contractTypeUpdate = await this.prisma.contractType.update({
      where: {
        id,
      },
      data: {
        ...updateContractTypeDto,
      },
    });

    return contractTypeUpdate;
  }

  async remove(id: string): Promise<TContractType> {
    const contractTypeDelete = await this.prisma.contractType.delete({
      where: {
        id,
      },
    });

    return contractTypeDelete;
  }
}
