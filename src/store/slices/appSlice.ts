/*
 * @Author: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @Date: 2025-06-05 22:55:44
 * @LastEditors: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @LastEditTime: 2025-06-05 23:04:45
 * @FilePath: /buzz/src/store/slices/appSlice.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  activeTab: string;
  isVideoTabActive: boolean;
  shouldPauseAllVideos: boolean;
}

const initialState: AppState = {
  activeTab: 'Home',
  isVideoTabActive: true,
  shouldPauseAllVideos: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
      // 如果当前tab是Home，则设置isVideoTabActive为true
      state.isVideoTabActive = action.payload === 'Home';
      // 如果切换到其他tab，则暂停所有视频
      state.shouldPauseAllVideos = action.payload !== 'Home';
    },
    setShouldPauseAllVideos: (state, action: PayloadAction<boolean>) => {
      state.shouldPauseAllVideos = action.payload;
    },
  },
});

export const { setActiveTab, setShouldPauseAllVideos } = appSlice.actions;

export default appSlice.reducer; 