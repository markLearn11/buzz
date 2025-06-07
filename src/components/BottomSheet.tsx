import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
// 获取状态栏高度
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;
// 估算底部安全区域高度
const BOTTOM_SAFE_AREA_HEIGHT = Platform.OS === 'ios' ? 34 : 0;

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  height?: number | string;
  children: React.ReactNode;
  backgroundColor?: string;
  handleColor?: string;
  closeOnBackdropPress?: boolean;
  contentContainerStyle?: ViewStyle;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  height = '50%',
  children,
  backgroundColor = '#18181B',
  handleColor = '#FFFFFF',
  closeOnBackdropPress = true,
  contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);
  const lastTapTime = useRef(0);
  
  // 计算底部弹窗的实际高度
  const defaultHeight = typeof height === 'number' 
    ? height 
    : Math.round(SCREEN_HEIGHT * (parseInt(height) / 100));
  
  // 全屏高度减去状态栏和安全区域
  const fullScreenHeight = SCREEN_HEIGHT - STATUS_BAR_HEIGHT;
  
  // 当前应用的高度
  const sheetHeight = isExpanded ? fullScreenHeight : defaultHeight;
  
  // 动画值
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  
  // 处理弹窗显示和隐藏
  useEffect(() => {
    if (isVisible) {
      backdropOpacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      // 关闭时重置展开状态
      setIsExpanded(false);
    }
  }, [isVisible, backdropOpacity, translateY]);
  
  // 处理切换全屏
  const toggleExpand = () => {
    // 切换展开状态
    setIsExpanded(prev => !prev);
  };
  
  // 处理双击顶部条
  const handleHeaderTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 双击判定时间间隔(毫秒)
    
    if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
      // 双击，切换全屏/默认高度
      toggleExpand();
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
    }
  };
  
  // 处理手势
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // 允许向下拖动关闭，如果是展开状态，也允许拖动到默认高度
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      // 判断应该到达的位置
      if (event.translationY > sheetHeight * 0.2) {
        // 向下拖动距离较大
        if (isExpanded && event.translationY < sheetHeight * 0.5) {
          // 如果是从全屏状态，且拖动不太多，收起到默认高度
          runOnJS(setIsExpanded)(false);
          translateY.value = withTiming(0);
        } else {
          // 否则关闭弹窗
          runOnJS(onClose)();
        }
      } else if (event.translationY < -50 && !isExpanded) {
        // 向上拖动且幅度较大，展开到全屏
        runOnJS(setIsExpanded)(true);
        translateY.value = withTiming(0);
      } else {
        // 否则弹回原位
        translateY.value = withTiming(0);
      }
    },
  });
  
  // 弹窗动画样式
  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      height: withTiming(sheetHeight, { duration: 300 }),
    };
  });
  
  // 背景蒙层动画样式
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });
  
  return (
    <>
      {isVisible && (
        <>
          {/* 背景蒙层 */}
          <TouchableWithoutFeedback 
            onPress={closeOnBackdropPress ? onClose : undefined}
          >
            <Animated.View 
              style={[
                styles.backdrop, 
                backdropAnimatedStyle
              ]} 
            />
          </TouchableWithoutFeedback>
          
          {/* 底部弹窗 */}
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View 
              style={[
                styles.sheetContainer, 
                { 
                  backgroundColor,
                  paddingBottom: insets.bottom,
                },
                sheetAnimatedStyle
              ]}
            >
              {/* 顶部拖动条区域 */}
              <TouchableOpacity 
                style={styles.handleContainer}
                onPress={handleHeaderTap}
                activeOpacity={0.7}
              >
                <View style={[styles.handle, { backgroundColor: handleColor }]} />
                
                {/* 添加展开/收起按钮 */}
                <TouchableOpacity 
                  style={styles.expandButton}
                  onPress={toggleExpand}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Ionicons 
                    name={isExpanded ? "chevron-down" : "chevron-up"} 
                    size={20} 
                    color={handleColor} 
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              
              {/* 内容 */}
              <View style={[styles.contentContainer, contentContainerStyle]}>
                {children}
              </View>
            </Animated.View>
          </PanGestureHandler>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1001,
    overflow: 'hidden',
  },
  handleContainer: {
    width: '100%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.7,
  },
  expandButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default BottomSheet; 