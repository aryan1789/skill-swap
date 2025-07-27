import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { chatConnection } from '../services/chatConnectionService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { newMessageReceived } from '../store/userSlice';
import type { ChatMessage } from '../api/chatService';

/**
 * Global notification listener that triggers notification badges
 * when user receives messages while NOT on the chat page
 */
export const useGlobalNotifications = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const userGuid = useAppSelector((state) => state.user.userGuid);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn || !userGuid) return;

    // Set up global message listener
    const handleGlobalMessage = (message: ChatMessage) => {
      // Only trigger notification if user is NOT on the chat page
      // and the message is not from the current user
      if (location.pathname !== '/chat' && message.senderId !== userGuid) {
        dispatch(newMessageReceived());
      }
    };

    // Connect to SignalR and set up listener
    const setupGlobalListener = async () => {
      try {
        await chatConnection.connect();
        chatConnection.onMessage(handleGlobalMessage);
      } catch (error) {
        console.error('Failed to set up global notification listener:', error);
      }
    };

    setupGlobalListener();

    // Cleanup
    return () => {
      chatConnection.removeMessageCallback(handleGlobalMessage);
    };
  }, [dispatch, location.pathname, userGuid, isLoggedIn]);
};
