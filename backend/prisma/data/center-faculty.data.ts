export interface IBaseCenterFaculty {
  id: string;
  name: string;
}

export const centersSeed = {
  copan: {
    id: 'fdc02f02-12b8-46bc-8fc5-9866364f1b15',
    name: 'UNAH Campus Copán',
  },
  craedCopan: {
    id: '16162d8d-c5e1-43e7-a6fb-e11824564e82',
    name: 'UNAH CRAED Copán',
  },
};

// export const facultiesSeed = [
//   'Humanidades y Artes',
//   'Ciencias Sociales',
//   'Ciencias',
//   'Ciencias Económicas',
//   'Ciencias Jurídicas',
//   'Ciencias Médicas',
//   'Ciencias Espaciales',
//   'Odontología',
//   'Química y Farmacia',
//   'Ingeniería',
// ];

export const facultiesSeed = {
  humanidades: {
    id: 'e84b2e9c-74d4-44a7-aeab-c0ade22234aa',
    name: 'Humanidades y Artes',
  },
  sociales: {
    id: 'f9de3840-0b3b-4508-8e00-3843795abf3e',
    name: 'Ciencias Sociales',
  },
  ciencias: {
    id: '2bfd0df1-bdce-4a0f-a47d-0ec65061bc0e',
    name: 'Ciencias',
  },
  economicas: {
    id: 'c1de60d1-912e-44d2-8194-16fada28d9e9',
    name: 'Ciencias Económicas',
  },
  juridicas: {
    id: '41adab2b-cc68-471c-adcc-c7454afa66e0',
    name: 'Ciencias Jurídicas',
  },
  medicas: {
    id: '1c510e18-827b-4635-8360-25ae07b92c1b',
    name: 'Ciencias Médicas',
  },
  espaciales: {
    id: 'c30a3a17-4d9c-48d3-8a75-4af67cec94a1',
    name: 'Ciencias Espaciales',
  },
  odontologia: {
    id: 'd5e9ff08-b2d6-4e9d-99c5-8e7236bef58b',
    name: 'Odontología',
  },
  quimica: {
    id: '52e32f79-9012-4f00-96df-282ef5517d1b',
    name: 'Química y Farmacia',
  },
  ingenieria: {
    id: 'c6d8a87b-b341-4cd8-9864-166caae75ea0',
    name: 'Ingeniería',
  },
};
