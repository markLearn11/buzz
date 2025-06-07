/*
 * @Author: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @Date: 2025-06-06 15:52:00
 * @LastEditors: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @LastEditTime: 2025-06-08 02:53:00
 * @FilePath: /buzz/src/config/env.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 环境配置
import { Platform } from 'react-native';

interface EnvConfig {
  API_BASE_URL: string;
  ENV_NAME: string;
}

// 获取本地IP地址
// 注意：这只是一个辅助函数，实际上需要手动设置正确的IP地址
const getLocalIpAddress = (): string => {
  // 根据平台选择正确的IP地址
  if (Platform.OS === 'android') {
    // 在Android模拟器中使用10.0.2.2可以访问到宿主机的localhost
    return '10.0.2.2';
  } else if (Platform.OS === 'ios') {
    // 在iOS模拟器中使用localhost
    return 'localhost';
  }
  
  // 默认情况下，使用localhost
  // 如果在真机上测试，请替换为您的计算机实际IP地址，例如:
  // return '192.168.1.9';
  return 'localhost';
};

// 开发环境配置
const devConfig: EnvConfig = {
  // 使用动态IP地址或localhost
  API_BASE_URL: `http://${getLocalIpAddress()}:9090/api`,
  ENV_NAME: 'development'
};

// 测试环境配置
const stagingConfig: EnvConfig = {
  API_BASE_URL: 'https://buzz-api-staging.example.com/api',
  ENV_NAME: 'staging'
};

// 生产环境配置
const prodConfig: EnvConfig = {
  API_BASE_URL: 'https://buzz-api.example.com/api',
  ENV_NAME: 'production'
};

// 根据当前环境选择配置
const getEnvConfig = (): EnvConfig => {
  if (__DEV__) {
    console.log('运行在开发环境，API地址:', devConfig.API_BASE_URL);
    return devConfig;
  }
  
  // 这里可以添加测试环境判断逻辑
  // 目前简单地使用开发环境和生产环境的区分
  console.log('运行在生产环境，API地址:', prodConfig.API_BASE_URL);
  return prodConfig;
};

// 导出当前环境配置
const currentConfig = getEnvConfig();
export const API_BASE_URL = currentConfig.API_BASE_URL;
export default currentConfig; 