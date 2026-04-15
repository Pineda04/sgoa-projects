export enum EPrismaClientErrors {
  TOO_LONG = 'P2000', // => "The provided value for the column is too long for the column's type. Column: {column_name}"
  DOES_NOT_EXISTS = 'P2001', // => "The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist"
  UNIQUE = 'P2002', // => "Unique constraint failed on the {constraint}"
}

export class PrismaClientErrors {
  unique = (field: string, model: string) =>
    `'Hay una violación de restricciones única, un nuevo ${model} no puede ser creado con ${field}.`;
}
