# Buzz 应用国际化（i18n）功能更新

## 概述

本次更新实现了应用的多语言支持功能。现在，当用户在语言设置中选择不同的语言后，应用界面（包括底部标签栏）将会切换为相应的语言。

## 支持的语言

- 简体中文 (zh)
- 英文 (en)
- 日语 (ja)
- 韩语 (ko)

## 安装步骤

1. 首先安装新的依赖包：

```bash
npm install i18next react-i18next --save
# 或者使用 yarn
yarn add i18next react-i18next
```

2. 安装完成后，重启应用：

```bash
npm start
# 或者
yarn start
```

## 使用方法

1. 启动应用后，进入"我的" -> "设置" -> "语言设置"
2. 选择您偏好的语言
3. 应用将立即切换到选择的语言，包括底部导航栏的标签文本

## 如何添加更多翻译

翻译文件位于 `src/i18n/translations/` 目录下。如果您需要添加更多的翻译项，请编辑相应的语言文件。

例如，要添加中文翻译，编辑 `src/i18n/translations/zh.ts` 文件。

## 在代码中使用

在React组件中使用翻译的方法：

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('common.hello')}</Text>
  );
};
```

## 注意事项

- 某些系统消息可能需要重启应用才能更新语言
- 目前日语和韩语翻译只包含了基本的底部标签栏文本，其他部分需要进一步完善
- 应用会记住用户的语言选择，下次启动时自动使用 