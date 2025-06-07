import { ThunkAction, Action } from '@reduxjs/toolkit';
import { RootState } from './index';

// 定义Thunk Action类型
export type AppThunkAction<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>; 