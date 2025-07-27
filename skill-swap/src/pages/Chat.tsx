import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { useAppDispatch } from "../store/hooks";
import { markMessagesAsRead } from "../store/userSlice";
import { getChatPreviews } from "../api/chatService";
import { useAppSelector } from "../store/hooks";
import "./Chat.css";

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userGuid = useAppSelector((state) => state.user.userGuid);
  const [selectedChat, setSelectedChat] = useState<{
    skillSwapRequestId: string;
    otherUserName: string;
  } | null>(null);
  const dispatch = useAppDispatch();

  // Clear unread message notification when user visits chat page
  useEffect(() => {
    dispatch(markMessagesAsRead());
  }, [dispatch]);

  // Check for skillSwapRequestId in URL parameters
  useEffect(() => {
    const skillSwapRequestId = searchParams.get("skillSwapRequestId");
    if (skillSwapRequestId && userGuid) {
      // Find the chat with this skillSwapRequestId to get the other user's name
      getChatPreviews(userGuid)
        .then((chats) => {
          const targetChat = chats.find(chat => chat.skillSwapRequestId === skillSwapRequestId);
          if (targetChat) {
            setSelectedChat({
              skillSwapRequestId,
              otherUserName: targetChat.otherUserName,
            });
          }
        })
        .catch((err) => console.error("Failed to find chat:", err));
    }
  }, [searchParams, userGuid]);

  const handleSelectChat = (skillSwapRequestId: string, otherUserName: string) => {
    setSelectedChat({ skillSwapRequestId, otherUserName });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="chat-container" style={styles.container}>
      <div className="chat-list-container" style={styles.chatListContainer}>
        <ChatList onSelectChat={handleSelectChat} />
      </div>
      <div className="chat-window-container" style={styles.chatWindowContainer}>
        {selectedChat ? (
          <ChatWindow
            skillSwapRequestId={selectedChat.skillSwapRequestId}
            otherUserName={selectedChat.otherUserName}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="no-chat-selected" style={styles.noChatSelected}>
            <div className="no-chat-message" style={styles.noChatMessage}>
              <h3>Welcome to SkillSwap Chat</h3>
              <p>Select a chat from the list to start messaging</p>
              <div className="chat-icon" style={styles.chatIcon}>💬</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "calc(100vh - 80px)", // Subtract navbar height
    marginTop: "80px", // Account for navbar
    backgroundColor: "var(--bg)", // Use theme background
  },
  chatListContainer: {
    width: "400px",
    height: "100%",
    borderRight: "1px solid var(--border)",
    backgroundColor: "var(--card)", // Use normal card color
  },
  chatWindowContainer: {
    flex: 1,
    height: "100%",
    backgroundColor: "var(--card)", // Use normal card color
  },
  noChatSelected: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    backgroundColor: "var(--card)", // Use normal card color
  },
  noChatMessage: {
    textAlign: "center",
    color: "var(--text-secondary)",
  },
  chatIcon: {
    fontSize: "4rem",
    marginTop: "1rem",
    opacity: 0.3,
  },
};

export default Chat;
