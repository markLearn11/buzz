# 应用国际化指南

## 概述

要使整个应用支持多语言，需要替换所有硬编码的文本为i18n翻译函数。以下是详细步骤：

## 步骤 1: 在组件中引入翻译hook

在每个React组件的顶部添加：

```javascript
import { useTranslation } from 'react-i18next';

// 在组件内部使用
const { t } = useTranslation();
```

## 步骤 2: 替换所有文本

将所有静态文本替换为翻译函数：

```javascript
// 替换前
<Text>个人资料</Text>

// 替换后
<Text>{t('profile.title')}</Text>
```

## 步骤 3: 在翻译文件中添加对应的翻译键

确保在`src/i18n/translations/`下的所有语言文件中添加对应的翻译键：

例如在`zh.ts`中：
```javascript
export default {
  // ...其他翻译
  profile: {
    title: '个人资料'
  }
}
```

在`en.ts`中：
```javascript
export default {
  // ...其他翻译
  profile: {
    title: 'Profile'
  }
}
```

## 常见组件翻译示例

### 按钮

```javascript
<Button title={t('common.save')} onPress={handleSave} />
```

### 输入框占位符

```javascript
<TextInput placeholder={t('auth.enterUsername')} />
```

### 警告框

```javascript
Alert.alert(
  t('common.warning'),
  t('profile.deleteConfirm'),
  [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.confirm'), onPress: handleDelete }
  ]
);
```

### 动态值

```javascript
<Text>{t('profile.postsCount', { count: posts.length })}</Text>
```

在翻译文件中：
```javascript
{
  profile: {
    postsCount: '共{{count}}篇帖子'
  }
}
```

## 优先处理的文件

为了快速实现整个应用的国际化，建议按以下顺序处理文件：

1. 通用组件 (`src/components/`)
2. 主要导航和标签栏 (`src/navigation/`)
3. 身份验证相关页面 (`src/screens/auth/`)
4. 设置相关页面 (`src/screens/settings/`)
5. 主要功能页面 (`src/screens/`)

## 自动化工具

考虑使用以下命令行工具，帮助提取应用中的所有文本为翻译键：

```bash
npm install i18next-scanner --save-dev
```

然后创建配置文件并运行扫描器，可以自动提取许多文本。

## 测试

国际化完成后，确保在每种语言下测试应用，特别注意：

1. 文本是否正确翻译
2. 布局是否适应不同长度的文本
3. 特殊字符是否正确显示
4. 日期、时间和数字格式是否正确

## 动态内容和API数据

对于从API获取的数据，考虑以下策略：

1. 服务端提供多语言内容
2. 客户端根据当前语言请求相应的内容
3. 对于无法翻译的内容，使用原始语言并标明

## 提示

- 使用有意义的翻译键，遵循层次结构
- 将常用文本放在`common`命名空间下
- 定期更新翻译文件
- 考虑使用自动翻译API初步翻译，然后人工审核 