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

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Chats</h3>
      <div style={styles.chatList}>
        {chats.length === 0 ? (
          <div style={styles.emptyState}>
            No chats yet.
            <br />
            Accept a skill swap request to start chatting!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.skillSwapRequestId}
              style={{
                ...styles.chatItem,
                ...(chat.hasUnreadMessages ? styles.unreadChat : {}),
              }}
              onClick={() => onSelectChat(chat.skillSwapRequestId, chat.otherUserName)}
              onMouseEnter={(e) => {
                if (!chat.hasUnreadMessages) {
                  e.currentTarget.style.backgroundColor = "var(--card-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!chat.hasUnreadMessages) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
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
          ))
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    maxWidth: "400px",
    height: "100%",
    backgroundColor: "var(--card)",
    borderRight: "2px solid var(--border)",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    padding: "1rem",
    margin: 0,
    borderBottom: "2px solid var(--border)",
    color: "var(--text)",
    fontWeight: 600,
    backgroundColor: "var(--card)",
  },
  loading: {
    padding: "2rem",
    textAlign: "center",
    color: "var(--text-secondary)",
  },
  error: {
    padding: "2rem",
    textAlign: "center",
    color: "#dc3545",
  },
  emptyState: {
    padding: "2rem",
    textAlign: "center",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  chatList: {
    flex: 1,
    overflowY: "auto",
  },
  chatItem: {
    display: "flex",
    padding: "1rem",
    cursor: "pointer",
    borderBottom: "1px solid var(--border)",
    transition: "all 0.2s",
    alignItems: "center",
    gap: "0.75rem",
    position: "relative",
  },
  unreadChat: {
    backgroundColor: "var(--card-hover)",
    borderLeft: "4px solid #0077cc",
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
    border: "2px solid var(--border)",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: "14px",
    height: "14px",
    backgroundColor: "#0077cc",
    borderRadius: "50%",
    border: "2px solid var(--card)",
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
    color: "var(--text)",
    fontSize: "0.95rem",
  },
  timestamp: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
  },
  lastMessage: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

export default ChatList;
