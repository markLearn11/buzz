import { Request } from 'express';

// 扩展 Request 接口，适配 multer 的 files 类型
export interface RequestWithFiles extends Request {
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
  file?: Express.Multer.File;
} 