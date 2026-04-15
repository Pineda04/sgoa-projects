// Quitar acentos y en mayusculas, para comparar textos o validaciones
export const normalizeText = (text: string): string =>
  text
    .toString() // Por si se utiliza un número o algún otro tipo de dato
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
