import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 异步actions
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password);
    } catch (error: any) {
      return rejectWithValue(error.message || '登录失败');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.register(username, email, password);
    } catch (error: any) {
      return rejectWithValue(error.message || '注册失败');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || '登出失败');
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (error: any) {
      return rejectWithValue(error.message || '获取用户信息失败');
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, userData }: { userId: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      return await authService.updateUserProfile(userId, userData);
    } catch (error: any) {
      return rejectWithValue(error.message || '更新用户资料失败');
    }
  }
);

export const updateAvatarAsync = createAsyncThunk(
  'auth/updateAvatar',
  async ({ userId, formData }: { userId: string; formData: FormData }, { rejectWithValue }) => {
    try {
      return await authService.updateUserAvatar(userId, formData);
    } catch (error: any) {
      return rejectWithValue(error.message || '更新用户头像失败');
    }
  }
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 注册
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 登出
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      
      // 获取当前用户
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 更新资料
      .addCase(updateProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('正在更新用户资料...');
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        console.log('用户资料更新成功:', action.payload);
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        console.error('用户资料更新失败:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 更新头像
      .addCase(updateAvatarAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('正在更新用户头像...');
      })
      .addCase(updateAvatarAsync.fulfilled, (state, action) => {
        console.log('用户头像更新成功:', action.payload);
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateAvatarAsync.rejected, (state, action) => {
        console.error('用户头像更新失败:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, loginSuccess, registerSuccess } = authSlice.actions;

export default authSlice.reducer; 