import { centersSeed } from './center-faculty.data';

export const buildingsSeed = [
  {
    id: '986a15a6-cb60-4e30-a9df-e726e69b52cf',
    name: 'Teledocencia',
    color: 'No definido',
    floors: '1',
    centerId: centersSeed.copan.id,
  },
  {
    id: '1db447b6-8767-4eb4-b7cb-1c727c130447',
    name: 'B-Learning',
    color: 'No definido',
    floors: '1',
    centerId: centersSeed.copan.id,
  },
  {
    id: '3934f69c-1679-464d-b5c9-27949a7ee1d4',
    name: 'Virtual',
    color: 'No definido',
    floors: '1',
    centerId: centersSeed.copan.id,
  },
  {
    id: '388ffcc7-adac-44f7-8b42-4dad55024905',
    name: 'Edificio 1',
    color: 'Verde y blanco',
    floors: '2',
    centerId: centersSeed.copan.id,
  },
  {
    id: '47823cc9-b33c-495e-b148-d075c50b5299',
    name: 'Edificio 2',
    color: 'Amarillo y granate',
    floors: '1',
    centerId: centersSeed.copan.id,
  },
  {
    id: 'd7d668d8-2ff0-4e3d-85d5-068b84ed9cc6',
    name: 'Edificio 3',
    color: 'Celeste y azul',
    floors: '2',
    centerId: centersSeed.copan.id,
  },
  {
    id: '536a56e4-9117-47b8-87fd-a7e1d29d8451',
    name: 'Edificio 4',
    color: 'Verde claro y beige',
    floors: '2',
    centerId: centersSeed.copan.id,
  },
  {
    id: '9b95cb4d-fa57-4146-bfa9-64fe52ef88a3',
    name: 'Biblioteca',
    color: 'Beige',
    floors: '1',
    centerId: centersSeed.copan.id,
  },
  {
    id: 'd3238ac4-9be6-4e1b-a35e-463da6a347fd',
    name: 'Ninguna',
    color: 'No definido',
    floors: '0',
    centerId: centersSeed.copan.id,
  },
  {
    id: '49902ab3-29c8-494d-a832-0b427ae14119',
    name: 'Ninguna',
    color: 'No definido',
    floors: '0',
    centerId: centersSeed.craedCopan.id,
  },
];

export const connectivitiesSeed = {
  noone: { id: '15e2500c-0f91-40b8-9e39-875f21649429', description: 'Ninguna' },
  wireless: {
    id: '2e4d0046-295c-46f5-8b36-d4e1ed996e8b',
    description: 'Inalámbrica',
  },
  ports2: {
    id: '08e01cba-4605-4015-b37e-557548fd47f8',
    description: '2 Puertos físicos',
  },
  ports4: {
    id: 'b41aa0c0-3987-4aa9-bddf-9fcf47741cda',
    description: '4 Puertos físicos',
  },
  points32: {
    id: 'bba1a4c5-fc20-4a3b-8394-e9d286014cd2',
    description: '32 Puntos',
  },
  ports21: {
    id: 'ea81024b-e71c-4a8a-9717-a037b0c8c76a',
    description: '21 Puertos',
  },
  ports8: {
    id: '13865bd4-3a68-46ad-af87-0675f7ce3b71',
    description: '8 Puertos físicos',
  },
};

export const roomTypesSeed = {
  conventionalClassroom: {
    id: 'c434eb16-3477-4408-8a8d-f5b5159b6299',
    description: 'Aula convencional',
  },
  postgraduate: {
    id: '2a2d2078-0805-49c4-b68c-7167353b0e66',
    description: 'Postgrado',
  },
  academicDepartment: {
    id: '3505d888-4208-498d-8fac-ef64d176ca07',
    description: 'Departamento académico',
  },
  administrativeDepartment: {
    id: '293573a5-01a2-4677-a52c-39bf51e0ec10',
    description: 'Departamento administrativo',
  },
  administrativeService: {
    id: 'cf7f6e2c-4473-4634-8cc1-edab63be39ec',
    description: 'Servicio administrativo',
  },
  laboratory: {
    id: '5c322d24-2f50-486f-bb00-47cfb186faa9',
    description: 'Laboratorio',
  },
  specializedSpace: {
    id: '4bd234e7-f543-4c63-b6c4-00b25fc20207',
    description: 'Espacio especializado',
  },
  virtualSpace: {
    id: '3228afdc-c881-4b06-852e-1c96732c1de5',
    description: 'Espacio virtual',
  },
};

export const audioEquipmentsSeed = {
  mic_wireless: {
    id: 'a1f3c9b4-2bfa-4d9e-9a6e-2d8f5c7a1b23',
    description: 'Micrófono inalámbrico',
  },
  mic_lapel: {
    id: 'b2d6e7a9-7c3f-4e0b-b83d-6f2a1d9e4f87',
    description: 'Micrófono de solapa',
  },
  speakers: {
    id: 'c3e4f1b2-9d7a-4f81-b28c-1a7b0e5d3c9f',
    description: 'Parlantes',
  },
  amplifier: {
    id: 'd4f5a8c3-1e6b-4d28-934b-0b2c9f7a6e4d',
    description: 'Amplificador de sonido',
  },
  sound_system: {
    id: 'e5a6b9d4-3c7f-4b6e-a1d3-8f4b2a0c9e7f',
    description: 'Sistema de sonido integrado',
  },
  mixer: {
    id: 'f6b7c0e5-2d8f-4a9c-9e3b-5c7a1b2d6f8e',
    description: 'Mezcladora de audio',
  },
  audio_interface: {
    id: 'a7c8d1f6-0e9b-4f7a-b3c2-1d9e4f87b2d6',
    description: 'Interfaz de audio',
  },
  headphones: {
    id: 'b8d9e2a7-1f0c-4e8b-a2d1-3c9f7a6e4d28',
    description: 'Auriculares',
  },
  player: {
    id: 'c9e0f3b8-2a1d-4f9c-b1e0-5d3c9f7a6e4d',
    description: 'Reproductor de audio',
  },
  control_panel: {
    id: 'd0f1a4c9-3b2e-4a0d-9f1b-7a6e4d28c9f7',
    description: 'Panel de control AV',
  },
};
