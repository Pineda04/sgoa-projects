import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CoursesService } from '../services/courses.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class ExistsCodeCourseValidator implements ValidatorConstraintInterface {
  constructor(private readonly coursesService: CoursesService) {}

  async validate(code: string): Promise<boolean> {
    if (!code || typeof code !== 'string') return true;
    const exists = await this.coursesService.existsByCode(code);
    return !exists;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Ya existe un curso con el código <${args.value}>`;
  }
}
