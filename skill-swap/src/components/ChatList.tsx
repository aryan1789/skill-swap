import React, { useEffect, useState } from "react";
import { getChatPreviews, type ChatPreview } from "../api/chatService";
import { useAppSelector } from "../store/hooks";

interface ChatListProps {
  onSelectChat: (skillSwapRequestId: string, otherUserName: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const userGuid = useAppSelector((state) => state.user.userGuid);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!userGuid) return;

      try {
        setLoading(true);
        setError(null);
        const chatPreviews = await getChatPreviews(userGuid);
        setChats(chatPreviews);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
        setError("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userGuid]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Chats</h3>
        <div style={styles.loading}>Loading chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Chats</h3>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Chats</h3>
        <div style={styles.emptyState}>
          No active chats yet. Accept a skill swap request to start chatting!
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Chats</h3>
      <div style={styles.chatList}>
        {chats.map((chat) => (
          <div
            key={chat.skillSwapRequestId}
            style={{
              ...styles.chatItem,
              ...(chat.hasUnreadMessages ? styles.unreadChat : {}),
            }}
            onClick={() => onSelectChat(chat.skillSwapRequestId, chat.otherUserName)}
          >
            <div style={styles.avatarContainer}>
              <img
                src={chat.otherUserProfilePicture || "Default_pfp.jpg"}
                alt={`${chat.otherUserName}'s profile`}
                style={styles.avatar}
              />
              {chat.hasUnreadMessages && <div style={styles.unreadBadge} />}
            </div>
            <div style={styles.chatContent}>
              <div style={styles.chatHeader}>
                <span 
                  style={{
                    ...styles.userName,
                    ...(chat.hasUnreadMessages ? styles.unreadText : {}),
                  }}
                >
                  {chat.otherUserName}
                </span>
                {chat.lastMessageTime && (
                  <span style={styles.timestamp}>
                    {formatTime(chat.lastMessageTime)}
                  </span>
                )}
              </div>
              <div 
                style={{
                  ...styles.lastMessage,
                  ...(chat.hasUnreadMessages ? styles.unreadText : {}),
                }}
              >
                {chat.lastMessage || "No messages yet"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    maxWidth: "400px",
    height: "100%",
    backgroundColor: "var(--card-inverse)",
    borderRight: "1px solid #e1e5e9",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    padding: "1rem",
    margin: 0,
    borderBottom: "1px solid #e1e5e9",
    color: "var(--card-inverse-text)",
    fontWeight: 600,
  },
  loading: {
    padding: "2rem",
    textAlign: "center",
    color: "#6c757d",
  },
  error: {
    padding: "2rem",
    textAlign: "center",
    color: "#dc3545",
  },
  emptyState: {
    padding: "2rem",
    textAlign: "center",
    color: "#6c757d",
    lineHeight: 1.5,
  },
  chatList: {
    flex: 1,
    overflowY: "auto",
  },
  chatItem: {
    display: "flex",
    padding: "0.75rem 1rem",
    cursor: "pointer",
    borderBottom: "1px solid #f8f9fa",
    transition: "background-color 0.2s",
    alignItems: "center",
    gap: "0.75rem",
  },
  unreadChat: {
    backgroundColor: "#f8f9ff",
  },
  unreadText: {
    fontWeight: "bold",
  },
  avatarContainer: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "12px",
    height: "12px",
    backgroundColor: "#0077cc",
    borderRadius: "50%",
    border: "2px solid white",
  },
  chatContent: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.25rem",
  },
  userName: {
    fontWeight: 600,
    color: "var(--card-inverse-text)",
    fontSize: "0.95rem",
  },
  timestamp: {
    fontSize: "0.75rem",
    color: "#6c757d",
  },
  lastMessage: {
    fontSize: "0.85rem",
    color: "#6c757d",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

export default ChatList;
