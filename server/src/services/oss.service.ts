import OSS from 'ali-oss';
import fs from 'fs';
import path from 'path';
import { AppError } from '../middlewares/error.middleware';

// 创建OSS客户端（如果配置了凭证）
let client: OSS | null = null;
let useLocalStorage = false;

// 检查OSS凭证是否存在
if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET && process.env.OSS_BUCKET) {
  try {
    client = new OSS({
      region: process.env.OSS_REGION || 'oss-cn-hangzhou',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET
    });
    console.log('阿里云OSS已初始化');
  } catch (error) {
    console.error('OSS初始化失败，将使用本地存储:', error);
    useLocalStorage = true;
  }
} else {
  console.log('未找到OSS凭证，将使用本地存储');
  useLocalStorage = true;
}

// 本地存储路径
const localStoragePath = path.join(__dirname, '../../../public');

// 确保本地存储目录存在
if (useLocalStorage) {
  if (!fs.existsSync(localStoragePath)) {
    fs.mkdirSync(localStoragePath, { recursive: true });
  }
  
  // 创建子目录
  const dirs = ['videos', 'covers', 'avatars'];
  dirs.forEach(dir => {
    const dirPath = path.join(localStoragePath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });
}

// 上传文件到OSS或本地存储
export const uploadToOSS = async (filePath: string, ossPath: string): Promise<string> => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new AppError('文件不存在', 400);
    }
    
    if (useLocalStorage) {
      // 使用本地存储
      const fileName = path.basename(ossPath);
      const dir = ossPath.split('/')[0]; // 获取第一段路径作为目录（videos/covers/avatars）
      const destDir = path.join(localStoragePath, dir);
      const destPath = path.join(destDir, fileName);
      
      // 确保目标目录存在
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // 复制文件
      fs.copyFileSync(filePath, destPath);
      
      // 删除临时文件
      fs.unlinkSync(filePath);
      
      // 返回相对URL
      return `/public/${dir}/${fileName}`;
    } else if (client) {
      // 上传到OSS
      const result = await client.put(ossPath, path.normalize(filePath));
      
      // 删除本地临时文件
      fs.unlinkSync(filePath);
      
      // 返回文件URL
      return result.url;
    } else {
      throw new AppError('存储服务未初始化', 500);
    }
  } catch (error) {
    console.error('文件上传错误:', error);
    throw new AppError('文件上传失败', 500);
  }
};

// 从OSS或本地存储删除文件
export const deleteFromOSS = async (ossPath: string): Promise<void> => {
  try {
    if (useLocalStorage) {
      // 从本地存储删除
      const fileName = path.basename(ossPath);
      const dir = ossPath.split('/')[0];
      const filePath = path.join(localStoragePath, dir, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } else if (client) {
      // 从OSS删除
      await client.delete(ossPath);
    } else {
      throw new AppError('存储服务未初始化', 500);
    }
  } catch (error) {
    console.error('文件删除错误:', error);
    throw new AppError('文件删除失败', 500);
  }
};

// 获取OSS文件临时访问URL
export const getSignedUrl = async (ossPath: string, expiresInSeconds: number = 3600): Promise<string> => {
  try {
    if (useLocalStorage) {
      // 本地存储直接返回路径
      const fileName = path.basename(ossPath);
      const dir = ossPath.split('/')[0];
      return `/public/${dir}/${fileName}`;
    } else if (client) {
      // 从OSS获取签名URL
      const url = client.signatureUrl(ossPath, { expires: expiresInSeconds });
      return url;
    } else {
      throw new AppError('存储服务未初始化', 500);
    }
  } catch (error) {
    console.error('获取文件访问链接错误:', error);
    throw new AppError('获取文件访问链接失败', 500);
  }
}; 