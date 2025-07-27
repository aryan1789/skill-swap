import React, { useState, useEffect } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { useAppDispatch } from "../store/hooks";
import { markMessagesAsRead } from "../store/userSlice";

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<{
    skillSwapRequestId: string;
    otherUserName: string;
  } | null>(null);
  const dispatch = useAppDispatch();

  // Clear unread message notification when user visits chat page
  useEffect(() => {
    dispatch(markMessagesAsRead());
  }, [dispatch]);

  const handleSelectChat = (skillSwapRequestId: string, otherUserName: string) => {
    setSelectedChat({ skillSwapRequestId, otherUserName });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatListContainer}>
        <ChatList onSelectChat={handleSelectChat} />
      </div>
      <div style={styles.chatWindowContainer}>
        {selectedChat ? (
          <ChatWindow
            skillSwapRequestId={selectedChat.skillSwapRequestId}
            otherUserName={selectedChat.otherUserName}
            onClose={handleCloseChat}
          />
        ) : (
          <div style={styles.noChatSelected}>
            <div style={styles.noChatMessage}>
              <h3>Welcome to SkillSwap Chat</h3>
              <p>Select a chat from the list to start messaging</p>
              <div style={styles.chatIcon}>💬</div>
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
    height: "100vh",
    paddingTop: "80px", // Account for header
    backgroundColor: "#f8f9fa",
  },
  chatListContainer: {
    width: "400px",
    height: "100%",
    borderRight: "1px solid #e1e5e9",
  },
  chatWindowContainer: {
    flex: 1,
    height: "100%",
  },
  noChatSelected: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    backgroundColor: "var(--card-inverse)",
  },
  noChatMessage: {
    textAlign: "center",
    color: "#6c757d",
  },
  chatIcon: {
    fontSize: "4rem",
    marginTop: "1rem",
    opacity: 0.3,
  },
};

export default Chat;
