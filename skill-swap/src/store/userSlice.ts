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

// Function to load initial state from localStorage (Redux's "memory backup")
const loadInitialState = (): UserState => {
  try {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    const supabaseUid = localStorage.getItem("supabaseUid");
    const userGuid = localStorage.getItem("userGuid");
    
    // If we have auth data, restore the logged-in state
    if (token && userJson && supabaseUid && userGuid) {
      const currentUser = JSON.parse(userJson);
      console.log("Redux: Restoring auth state from localStorage");
      return {
        currentUser,
        isLoggedIn: true,
        loading: false,
        error: null,
        token,
        supabaseUid,
        userGuid,
      };
    }
  } catch (error) {
    console.error("Redux: Failed to restore state from localStorage:", error);
  }
  
  // Default state if no valid auth data found
  console.log("Redux: No auth data found, starting with logged-out state");
  return {
    currentUser: null,
    isLoggedIn: false,
    loading: false,
    error: null,
    token: null,
    supabaseUid: null,
    userGuid: null,
  };
};

// Initial state when app starts (restored from localStorage if available)
const initialState: UserState = loadInitialState();

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
      
      // Store in localStorage for persistence (ONLY place that writes to localStorage)
      try {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("supabaseUid", action.payload.supabaseUid);
        localStorage.setItem("userGuid", action.payload.userGuid);
      } catch (error) {
        console.error("Failed to save auth data to localStorage:", error);
      }
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
      
      // Clear localStorage (ONLY place that clears localStorage)
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("supabaseUid");
        localStorage.removeItem("userGuid");
      } catch (error) {
        console.error("Failed to clear auth data from localStorage:", error);
      }
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
