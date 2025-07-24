import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

// Create the Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
    // We can add more slices here later (e.g., theme, swapRequests)
  },
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
