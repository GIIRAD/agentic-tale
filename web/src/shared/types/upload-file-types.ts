
type FileMetadata = {
  filepath: string,
  size: number,
  name: string | null,
  yearbookId: string,
  moduleId: string,
  containerId: string,
  mimetype: string | null,
};

type ShortFileMetaData = {
  url: string,
  fileName: string,
  name: string,
};

type UploadedFileInformation = {
  name: string,
  url: string,
};

enum SupportedFileType {
  PNG = 'image/png',
  JPG = 'image/jpg',
  JPEG = 'image/jpeg',
  HEIC = 'image/heic',
  PDF = 'application/pdf',
}

const supportedFileList = Object.values(SupportedFileType);

export {
  SupportedFileType,
  supportedFileList,
};

export type {
  FileMetadata,
  ShortFileMetaData,
  UploadedFileInformation,
};
