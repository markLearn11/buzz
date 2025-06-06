/**
 * 将时间戳格式化为相对时间（例如：5分钟前，2小时前，3天前）
 * @param timestamp 时间戳
 * @returns 格式化后的相对时间字符串
 */
export const formatTime = (timestamp: number): string => {
  const now = new Date();
  const commentDate = new Date(timestamp);
  
  const diffTime = Math.abs(now.getTime() - commentDate.getTime());
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else {
    return `${diffDays}天前`;
  }
}; 