export type TAudioEquipment = {
 
  id: string;
  description: string;
};

export type TCreateAudioEquipment = Omit<TAudioEquipment, 'id'>;
export type TUpdateAudioEquipment = Partial<TCreateAudioEquipment>;
 