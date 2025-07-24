import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Define the shape of our user state
interface UserState {
  currentUser: any | null;  // We'll type this better later
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
  supabaseUid: string | null;
  userGuid: string | null;
}

// Initial state when app starts
const initialState: UserState = {
  currentUser: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  token: null,
  supabaseUid: null,
  userGuid: null,
};

// Create the slice - this contains our reducers and actions
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action: Start login process
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Action: Login successful
    loginSuccess: (state, action: PayloadAction<{
      user: any;
      token: string;
      supabaseUid: string;
      userGuid: string;
    }>) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.supabaseUid = action.payload.supabaseUid;
      state.userGuid = action.payload.userGuid;
      state.error = null;
    },
    
    // Action: Login failed
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isLoggedIn = false;
      state.currentUser = null;
      state.token = null;
      state.supabaseUid = null;
      state.userGuid = null;
      state.error = action.payload;
    },
    
    // Action: Logout user
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.token = null;
      state.supabaseUid = null;
      state.userGuid = null;
      state.error = null;
      state.loading = false;
    },
    
    // Action: Update user profile
    updateUserProfile: (state, action: PayloadAction<any>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    
    // Action: Clear error
    clearError: (state) => {
      state.error = null;
    }
  }
});

// Export actions so components can use them
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  clearError
} = userSlice.actions;

// Export the reducer to be used in store
export default userSlice.reducer;
