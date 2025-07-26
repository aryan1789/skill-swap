import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import themeReducer from './themeSlice';

// Create the Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
    // We can add more slices here later (e.g., swapRequests)
  },
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
