import { centersSeed, facultiesSeed } from './center-faculty.data';

// interface IKey {
//   id: string;
//   name: string;
// }

export interface IDepartment {
  id: string;
  name: string;
  facultyId: string;
}

// export const departmentsSeed = (
//   centersData: Record<string, IKey>,
//   facultiesData: Record<string, IKey>,
// ): Record<string, IDepartment> => ({
export const departmentsSeed: Record<string, IDepartment> = {
  sistemas: {
    id: '7d42d30f-f76b-4027-acf1-06663e37c859',
    name: 'Ingeniería en Sistemas',
    facultyId: facultiesSeed.ingenieria.id,
  },
  informatica: {
    id: '4663cd4a-a3a3-4cfe-9b3f-19e740f0d192',
    name: 'Área Infórmatica',
    facultyId: facultiesSeed.ingenieria.id,
  },
  quimica: {
    id: 'eeaa5030-18ec-45a2-a373-93c57f49f70f',
    name: 'Biología, Química y Microbiología',
    facultyId: facultiesSeed.ciencias.id,
  },
  matematicas: {
    id: '98d8e699-6f2b-4f23-b0a4-c54a382d8c4f',
    name: 'Matemáticas y Física',
    facultyId: facultiesSeed.ciencias.id,
  },
  enfermeria: {
    id: '14aeb884-bf3c-4deb-9060-38b57563f190',
    name: 'Enfermería',
    facultyId: facultiesSeed.medicas.id,
  },
  ingles: {
    id: '8a3cb735-59a3-4f66-ae63-c573f6583dfc',
    name: 'Inglés',
    facultyId: facultiesSeed.humanidades.id,
  },
  humanidades: {
    id: 'bac3daac-000d-47fe-963b-3539fdc3758a',
    name: 'Humanidades, Artes, Deportes y Sociales',
    facultyId: facultiesSeed.humanidades.id,
  },
  prod_ag: {
    id: 'c0def9f3-8e7a-4c62-9ff1-f702b6c3592f',
    name: 'Técnico en Producción Agrícola',
    facultyId: facultiesSeed.ingenieria.id,
  },
  admon_empresas: {
    id: '64e55ce7-f657-404a-8257-af838829aff4',
    name: 'Administración de Empresas',
    facultyId: facultiesSeed.economicas.id,
  },
  admon_ag: {
    id: '0f7bb894-6888-45c6-b3b2-5e315dc5ac0e',
    name: 'Administración de Empresas Agropecuarias',
    facultyId: facultiesSeed.ciencias.id,
  },
  pedagogia: {
    id: '554999c7-9dd2-4b8a-84dc-360f9e7ffdb2',
    name: 'Pedagogía',
    facultyId: facultiesSeed.humanidades.id,
  },
  sued: {
    id: '8d918575-438e-483d-8607-8f256d12d25a',
    name: 'Pedagogía del Sistema Universitario de Educación a Distancia (SUED)',
    facultyId: facultiesSeed.humanidades.id,
  },
  agroindustrial: {
    id: '012dc1d5-e92c-43d4-bc5c-4ae0594f8079',
    name: 'Ingeniería Agroindustrial',
    facultyId: facultiesSeed.ingenieria.id,
  },
  comercio: {
    id: 'efbfad5f-9148-4b74-8c77-e67a0b391d0f',
    name: 'Comercio Internacional',
    facultyId: facultiesSeed.economicas.id,
  },
  desarrollo: {
    id: '40b77303-e571-4c92-afea-598db117feda',
    name: 'Desarrollo Local',
    facultyId: facultiesSeed.sociales.id,
  },
  admon_cafe: {
    id: '6355af19-9808-4414-b981-bbc63e27ad54',
    name: 'Técnico en Administración de Empresas Cafetaleras',
    facultyId: facultiesSeed.economicas.id,
  },
  microfinanzas: {
    id: '074105c3-62a3-49d2-bbcb-be7e3bb48b66',
    name: 'Técnico en Microfinanzas',
    facultyId: facultiesSeed.economicas.id,
  },
  tucc: {
    id: '4d141fa9-9791-4d8d-a800-6b1ed4cc141b',
    name: 'Técnico Universitario en Control de Calidad del Café (TUCC)',
    facultyId: facultiesSeed.ingenieria.id,
  },
  pecuaria: {
    id: '68cdff39-50dd-4fb5-a3fa-06d0d5bb597d',
    name: 'Pecuaria',
    facultyId: facultiesSeed.ingenieria.id,
  },
};

export const centerDepartmentsSeed = [
  {
    id: 'e499cb3d-6339-4533-bce8-bebe52f6ab53',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.sistemas.id,
  },
  {
    id: '6b1f3435-f35b-47a5-b7ba-c11404662cd4',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.informatica.id,
  },
  {
    id: 'b4ac9b93-ada4-4567-b79c-57b8182bbc06',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.quimica.id,
  },
  {
    id: 'aaa0f498-1737-41d7-9c17-d109cbbf720d',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.matematicas.id,
  },
  {
    id: '90a60dac-7945-49f0-a34b-8e6f3fbf1349',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.enfermeria.id,
  },
  {
    id: '3be4390c-01e0-4dff-8622-1532401fc5ea',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.ingles.id,
  },
  {
    id: 'db352af9-e2d6-455c-ba12-bea8c9b8693a',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.humanidades.id,
  },
  {
    id: 'e8b49c64-81e5-4599-a821-443a665f0790',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.prod_ag.id,
  },
  {
    id: '86bbcdb4-5999-4be5-8d9f-5d6db62c047d',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.admon_empresas.id,
  },
  {
    id: '41b66183-3a5b-4753-9403-50d45c51f127',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.admon_ag.id,
  },
  {
    id: 'fb36f01f-1c9d-49ee-b879-bef9aa8de936',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.pedagogia.id,
  },
  {
    id: 'eb49939c-acc7-4f32-a517-29f60df6fdc9',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.sued.id,
  },
  {
    id: 'e68ab31a-1412-4307-bc39-48bbddef7e42',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.agroindustrial.id,
  },
  {
    id: '92eb2bf2-b3bf-4506-b684-2a0997ab9f42',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.comercio.id,
  },
  {
    id: 'ec1905cf-ef67-4abc-acb5-523ea813322c',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.desarrollo.id,
  },
  {
    id: '87dfaeac-c83c-49ec-9dfd-1755512cb9ae',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.admon_cafe.id,
  },
  {
    id: '08b2844d-31a8-48e2-ac34-19d8faf7694b',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.microfinanzas.id,
  },
  {
    id: 'f2e6dc2d-4f02-4c4c-81a9-eac2e8c27382',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.tucc.id,
  },
  {
    id: '35a0eb26-c32b-42db-bf60-2b9ba89858fb',
    centerId: centersSeed.copan.id,
    departmentId: departmentsSeed.pecuaria.id,
  },
  {
    id: '59a25dbf-7b6d-47b7-ae1a-bfc811507529',
    centerId: centersSeed.craedCopan.id,
    departmentId: departmentsSeed.desarrollo.id,
  },
];
