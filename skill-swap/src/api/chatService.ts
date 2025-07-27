const API_BASE_URL = "http://localhost:5209/api";

export interface ChatMessage {
  id: string;
  skillSwapRequestId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface ChatPreview {
  skillSwapRequestId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserProfilePicture: string;
  lastMessage: string;
  lastMessageTime: string;
  hasUnreadMessages: boolean;
}

// Get chat messages for a specific skill swap request
export const getChatMessages = async (skillSwapRequestId: string, userId: string): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/chat/${skillSwapRequestId}?userId=${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch chat messages: ${response.statusText}`);
  }
  return response.json();
};

// Get chat previews for a user
export const getChatPreviews = async (userId: string): Promise<ChatPreview[]> => {
  const response = await fetch(`${API_BASE_URL}/chat/previews/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch chat previews: ${response.statusText}`);
  }
  return response.json();
};

// Mark messages as read
export const markMessagesAsRead = async (skillSwapRequestId: string, userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chat/mark-read/${skillSwapRequestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userId),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to mark messages as read: ${response.statusText}`);
  }
};
