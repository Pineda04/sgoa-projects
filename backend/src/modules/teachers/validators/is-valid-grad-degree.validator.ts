import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { EDegreeType } from '../enums';
import { UndergradsService } from 'src/modules/teachers-degrees/services/undergrads.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidGradDegreeConstraint
  implements ValidatorConstraintInterface
{
  // Considerar que si alguien mas agrega otro, es probable que no se vea reflejado.
  // Es probable que se elimine.
  private cache = new Map<string, string[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly undergradService: UndergradsService,
  ) {}

  async validate(gradId: string, args: ValidationArguments): Promise<boolean> {
    const [degreeType] = args.constraints as EDegreeType[];

    if (this.cache.has(degreeType))
      return this.cache.get(degreeType)!.includes(gradId);

    let validIds: string[] = [];

    if (degreeType === EDegreeType.UNDERGRAD) {
      validIds = await this.getUndergradIds();
    }

    if (degreeType === EDegreeType.POSTGRAD) {
      validIds = await this.getPostgradIds();
    }

    if (validIds.length === 0) return false;

    this.cache.set(degreeType, validIds);

    return validIds.includes(gradId);
  }

  async getUndergradIds(): Promise<string[]> {
    const undergrads = await this.undergradService.findAll();

    return undergrads.map((el) => el.id);
  }

  async getPostgradIds(): Promise<string[]> {
    const postgrads = await this.prisma.postgraduateDegree.findMany({
      select: {
        id: true,
      },
    });

    return postgrads.map((el) => el.id);
  }

  defaultMessage(args: ValidationArguments) {
    const [degreeType] = args.constraints as EDegreeType[];
    const type = degreeType === EDegreeType.UNDERGRAD;

    return `El ${args.property} <$value> no fue encontrado en <${type ? 'pregrados' : 'postgrados'}>, por favor consulte los disponibles en <${type ? '/undergrads' : '/postgrads'}>.`;
  }
}

// export function IsValidGradDegree(degreeType: EDegreeType) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [degreeType],
//       validator: IsValidGradDegreeConstraint,
//     });
//   };
// }
