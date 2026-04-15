export const MULTIMEDIA_TYPES = {
  // Documentos
  PDF: 'PDF',
  DOCX: 'Word',
  XLSX: 'Excel',
  PPTX: 'PowerPoint',
  PLANETEXT: 'Texto Plano',
  RICHTEXT: 'Rich Text',
  OPENDOCUMENT: 'OpenDocument',

  // Imágenes
  JPEG: 'JPEG',
  JPG: 'JPG',
  PNG: 'PNG',
  GIF: 'GIF',
  BMP: 'BMP',
  TIFF: 'TIFF',
  SVG: 'SVG',
  WebP: 'WebP',
  HEIC: 'HEIC',

  // Audio
  MP3: 'MP3',
  WAV: 'WAV',
  AAC: 'AAC',
  FLAC: 'FLAC',
  OGG: 'OGG',
  M4A: 'M4A',

  // Video
  MP4: 'MP4',
  AVI: 'AVI',
  MKV: 'MKV',
  MOV: 'MOV',
  WMV: 'WMV',
  WebM: 'WebM',
  FLV: 'FLV',

  // Otros
  ZIP: 'ZIP',
  RAR: 'RAR',
  Z7: '7Z',
  JSON: 'JSON',
  HTML: 'HTML',
  Markdown: 'Markdown',
};

export const MULTIMEDIA_TYPES_EXTEND = {
  ...MULTIMEDIA_TYPES,
  DOC: 'Word',
  XLS: 'Excel',
  PPT: 'PowerPoint',
};
