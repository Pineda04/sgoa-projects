import {
  ValidatorConstraintInterface,
  ValidatorOptions,
  registerDecorator,
} from 'class-validator';

// TODO: CAMBIAR TODOS LOS VALIDATORS-CONTRAINTS DECORATOR'S POR ESTE, ASI NO SE REPITE EL MISMO CODIGO VARIAS VECES.
export function ValidatorConstraintDecorator<T>(
  configType: T,
  validatorClass: new (...args: any[]) => ValidatorConstraintInterface,
  validationOptions?: ValidatorOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [configType],
      validator: validatorClass,
    });
  };
}
