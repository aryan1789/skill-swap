import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Custom hook for dispatch with proper typing
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook for selector with proper typing
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Convenience hooks for common user state
export const useAuth = () => {
  const { isLoggedIn, currentUser, loading, error } = useAppSelector(state => state.user);
  return { isLoggedIn, currentUser, loading, error };
};

export const useUserData = () => {
  const { currentUser, supabaseUid, userGuid, token } = useAppSelector(state => state.user);
  return { currentUser, supabaseUid, userGuid, token };
};
